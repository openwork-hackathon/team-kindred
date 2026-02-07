// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IReputationOracle {
    function getScore(address user) external view returns (uint256);
}

/**
 * @title SimpleSwap
 * @notice Simple swap contract for demo with reputation-based dynamic fees
 * @dev Supports ETH <-> ERC20 swaps with KindredHook-style dynamic fees
 */
contract SimpleSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Fee tiers (basis points: 1 bp = 0.01%)
    uint256 public constant HIGH_TRUST_FEE = 15; // 0.15%
    uint256 public constant MEDIUM_TRUST_FEE = 22; // 0.22%
    uint256 public constant LOW_TRUST_FEE = 30; // 0.30%
    
    uint256 public constant HIGH_TRUST_THRESHOLD = 850;
    uint256 public constant MEDIUM_TRUST_THRESHOLD = 600;
    uint256 public constant MIN_SCORE_TO_TRADE = 100;
    
    uint256 public constant FEE_DENOMINATOR = 10000; // 100%

    IReputationOracle public immutable reputationOracle;
    
    // Token addresses
    address public immutable usdc;
    
    // Exchange rates (for demo simplicity, fixed rates)
    // In production, use Chainlink oracles
    uint256 public ethToUsdcRate = 2000 * 1e6; // 1 ETH = 2000 USDC (6 decimals)
    
    // Events
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee,
        uint256 reputation
    );
    
    event RateUpdated(uint256 newRate);
    event FeesWithdrawn(address token, uint256 amount);
    
    // Errors
    error InsufficientReputation(uint256 score, uint256 required);
    error InsufficientLiquidity();
    error InvalidAmount();
    error SlippageExceeded();

    constructor(address _reputationOracle, address _usdc) Ownable(msg.sender) {
        reputationOracle = IReputationOracle(_reputationOracle);
        usdc = _usdc;
    }

    /**
     * @notice Swap ETH for USDC
     * @param minAmountOut Minimum USDC to receive (slippage protection)
     */
    function swapETHForUSDC(uint256 minAmountOut) 
        external 
        payable 
        nonReentrant 
        returns (uint256 amountOut) 
    {
        if (msg.value == 0) revert InvalidAmount();
        
        // Check reputation
        uint256 score = reputationOracle.getScore(msg.sender);
        if (score < MIN_SCORE_TO_TRADE) {
            revert InsufficientReputation(score, MIN_SCORE_TO_TRADE);
        }
        
        // Calculate fee based on reputation
        uint256 feeBps = calculateFee(score);
        
        // Calculate output: ETH amount * rate * (1 - fee)
        uint256 grossOutput = (msg.value * ethToUsdcRate) / 1e18;
        uint256 fee = (grossOutput * feeBps) / FEE_DENOMINATOR;
        amountOut = grossOutput - fee;
        
        // Slippage check
        if (amountOut < minAmountOut) revert SlippageExceeded();
        
        // Check liquidity
        uint256 balance = IERC20(usdc).balanceOf(address(this));
        if (balance < amountOut) revert InsufficientLiquidity();
        
        // Transfer USDC to user
        IERC20(usdc).safeTransfer(msg.sender, amountOut);
        
        emit SwapExecuted(
            msg.sender,
            address(0), // ETH
            usdc,
            msg.value,
            amountOut,
            fee,
            score
        );
    }

    /**
     * @notice Swap USDC for ETH
     * @param amountIn USDC amount to swap (6 decimals)
     * @param minAmountOut Minimum ETH to receive
     */
    function swapUSDCForETH(uint256 amountIn, uint256 minAmountOut)
        external
        nonReentrant
        returns (uint256 amountOut)
    {
        if (amountIn == 0) revert InvalidAmount();
        
        // Check reputation
        uint256 score = reputationOracle.getScore(msg.sender);
        if (score < MIN_SCORE_TO_TRADE) {
            revert InsufficientReputation(score, MIN_SCORE_TO_TRADE);
        }
        
        // Calculate fee
        uint256 feeBps = calculateFee(score);
        
        // Calculate output: USDC amount / rate * (1 - fee)
        uint256 grossOutput = (amountIn * 1e18) / ethToUsdcRate;
        uint256 fee = (grossOutput * feeBps) / FEE_DENOMINATOR;
        amountOut = grossOutput - fee;
        
        // Slippage check
        if (amountOut < minAmountOut) revert SlippageExceeded();
        
        // Check liquidity
        if (address(this).balance < amountOut) revert InsufficientLiquidity();
        
        // Transfer USDC from user
        IERC20(usdc).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Transfer ETH to user
        (bool success, ) = msg.sender.call{value: amountOut}("");
        require(success, "ETH transfer failed");
        
        emit SwapExecuted(
            msg.sender,
            usdc,
            address(0), // ETH
            amountIn,
            amountOut,
            fee,
            score
        );
    }

    /**
     * @notice Calculate swap output (view function for UI)
     */
    function getSwapOutput(
        address user,
        bool ethToUsdc,
        uint256 amountIn
    ) external view returns (
        uint256 amountOut,
        uint256 fee,
        uint256 feeBps,
        uint256 reputation
    ) {
        reputation = reputationOracle.getScore(user);
        feeBps = calculateFee(reputation);
        
        uint256 grossOutput;
        if (ethToUsdc) {
            // ETH -> USDC
            grossOutput = (amountIn * ethToUsdcRate) / 1e18;
        } else {
            // USDC -> ETH
            grossOutput = (amountIn * 1e18) / ethToUsdcRate;
        }
        
        fee = (grossOutput * feeBps) / FEE_DENOMINATOR;
        amountOut = grossOutput - fee;
    }

    /**
     * @notice Calculate fee based on reputation (matches KindredHook)
     */
    function calculateFee(uint256 score) public pure returns (uint256) {
        if (score >= HIGH_TRUST_THRESHOLD) return HIGH_TRUST_FEE;
        if (score >= MEDIUM_TRUST_THRESHOLD) return MEDIUM_TRUST_FEE;
        return LOW_TRUST_FEE;
    }

    /**
     * @notice Check if user can trade
     */
    function canTrade(address user) external view returns (bool) {
        return reputationOracle.getScore(user) >= MIN_SCORE_TO_TRADE;
    }

    // ============ Admin Functions ============

    /**
     * @notice Update exchange rate (owner only)
     */
    function setRate(uint256 newRate) external onlyOwner {
        ethToUsdcRate = newRate;
        emit RateUpdated(newRate);
    }

    /**
     * @notice Add liquidity (ETH)
     */
    function addLiquidityETH() external payable onlyOwner {}

    /**
     * @notice Add liquidity (USDC)
     */
    function addLiquidityUSDC(uint256 amount) external onlyOwner {
        IERC20(usdc).safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @notice Withdraw collected fees
     */
    function withdrawFees(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            // ETH
            (bool success, ) = owner().call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            // ERC20
            IERC20(token).safeTransfer(owner(), amount);
        }
        
        emit FeesWithdrawn(token, amount);
    }

    /**
     * @notice Get contract balances
     */
    function getBalances() external view returns (
        uint256 ethBalance,
        uint256 usdcBalance
    ) {
        ethBalance = address(this).balance;
        usdcBalance = IERC20(usdc).balanceOf(address(this));
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
