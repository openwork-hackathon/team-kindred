// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title KindredHook
 * @notice Uniswap v4 Hook that adjusts fees based on reputation scores
 * @dev Implements the trust layer for DeFi - higher reputation = lower fees
 * @author Patrick Collins 🛡️ | Team Kindred
 */

interface IReputationOracle {
    function getScore(address account) external view returns (uint256);
    function isBlocked(address account) external view returns (bool);
}

contract KindredHook {
    // ============ State ============
    
    IReputationOracle public immutable reputationOracle;
    
    /// @notice Minimum reputation score required to trade (0-1000)
    uint256 public constant MIN_SCORE_TO_TRADE = 100;
    
    /// @notice Score thresholds for fee tiers
    uint256 public constant ELITE_THRESHOLD = 900;     // 0.1% fee
    uint256 public constant TRUSTED_THRESHOLD = 700;   // 0.2% fee
    uint256 public constant NORMAL_THRESHOLD = 400;    // 0.3% fee
    
    /// @notice Fee rates in basis points
    uint24 public constant FEE_ELITE = 10;      // 0.1%
    uint24 public constant FEE_TRUSTED = 20;    // 0.2%
    uint24 public constant FEE_NORMAL = 30;     // 0.3%
    uint24 public constant FEE_RISKY = 50;      // 0.5%
    
    // ============ Errors ============
    
    error ReputationTooLow(address account, uint256 score);
    error AccountBlocked(address account);
    error ZeroAddress();
    
    // ============ Events ============
    
    event SwapWithReputation(
        address indexed trader,
        uint256 reputationScore,
        uint24 feeApplied
    );

    // ============ Constructor ============
    
    constructor(address _reputationOracle) {
        if (_reputationOracle == address(0)) revert ZeroAddress();
        reputationOracle = IReputationOracle(_reputationOracle);
    }

    // ============ Core Functions ============
    
    /// @notice Calculate fee based on reputation score
    function calculateFee(uint256 score) public pure returns (uint24) {
        if (score >= ELITE_THRESHOLD) {
            return FEE_ELITE;
        } else if (score >= TRUSTED_THRESHOLD) {
            return FEE_TRUSTED;
        } else if (score >= NORMAL_THRESHOLD) {
            return FEE_NORMAL;
        } else {
            return FEE_RISKY;
        }
    }
    
    /// @notice Get the fee that would be applied for a given account
    function getFeeForAccount(address account) external view returns (uint24) {
        uint256 score = reputationOracle.getScore(account);
        return calculateFee(score);
    }
    
    /// @notice Check if an account can trade
    function canTrade(address account) external view returns (bool) {
        if (reputationOracle.isBlocked(account)) {
            return false;
        }
        uint256 score = reputationOracle.getScore(account);
        return score >= MIN_SCORE_TO_TRADE;
    }
    
    /// @notice Validate a trade (reverts if not allowed)
    function validateTrade(address trader) external view returns (uint24 fee) {
        if (reputationOracle.isBlocked(trader)) {
            revert AccountBlocked(trader);
        }
        
        uint256 score = reputationOracle.getScore(trader);
        
        if (score < MIN_SCORE_TO_TRADE) {
            revert ReputationTooLow(trader, score);
        }
        
        return calculateFee(score);
    }
}
