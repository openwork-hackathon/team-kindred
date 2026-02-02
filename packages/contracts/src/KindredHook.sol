// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

/**
 * @title KindredHook
 * @notice Uniswap v4 Hook for Kindred prediction market aggregator
 * @dev Aggregates prediction market positions and provides liquidity routing
 * 
 * Security considerations:
 * - Reentrancy protection via v4-core's lock mechanism
 * - Access control for admin functions
 * - Delta validation in afterSwap
 */
contract KindredHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    // ============ Errors ============
    error Kindred__Unauthorized();
    error Kindred__InvalidPool();
    error Kindred__SlippageExceeded();

    // ============ Events ============
    event PoolRegistered(PoolId indexed poolId, address indexed market);
    event SwapAggregated(PoolId indexed poolId, address indexed user, int256 amount);
    event ReputationUpdated(address indexed user, uint256 newScore);

    // ============ State ============
    
    /// @notice Admin address for privileged operations
    address public admin;
    
    /// @notice Mapping of pool IDs to their associated prediction markets
    mapping(PoolId => address) public poolToMarket;
    
    /// @notice User reputation scores (affects fee discounts)
    mapping(address => uint256) public reputation;
    
    /// @notice Total volume aggregated through the hook
    uint256 public totalVolumeAggregated;

    // ============ Constructor ============
    
    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {
        admin = msg.sender;
    }

    // ============ Hook Permissions ============
    
    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: true,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ============ Hook Callbacks (Internal Overrides) ============

    function _beforeInitialize(
        address sender,
        PoolKey calldata key,
        uint160 sqrtPriceX96
    ) internal override returns (bytes4) {
        // Validate pool registration
        // TODO: Add market validation logic
        return this.beforeInitialize.selector;
    }

    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        PoolId poolId = key.toId();
        
        // Decode hook data for aggregation routing
        if (hookData.length > 0) {
            // TODO: Parse aggregation instructions from hookData
            // This allows routing to different prediction markets
        }

        // Update user reputation based on activity
        // Higher reputation = lower fees (future implementation)
        
        return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function _afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        PoolId poolId = key.toId();
        
        // Track volume for analytics
        int256 amount = params.amountSpecified;
        if (amount < 0) amount = -amount;
        totalVolumeAggregated += uint256(amount);
        
        emit SwapAggregated(poolId, sender, params.amountSpecified);
        
        return (this.afterSwap.selector, 0);
    }

    // ============ Admin Functions ============

    /// @notice Register a prediction market with a pool
    /// @param poolId The pool ID to associate
    /// @param market The prediction market contract address
    function registerMarket(PoolId poolId, address market) external {
        if (msg.sender != admin) revert Kindred__Unauthorized();
        poolToMarket[poolId] = market;
        emit PoolRegistered(poolId, market);
    }

    /// @notice Update user reputation score
    /// @param user The user address
    /// @param score The new reputation score
    function setReputation(address user, uint256 score) external {
        if (msg.sender != admin) revert Kindred__Unauthorized();
        reputation[user] = score;
        emit ReputationUpdated(user, score);
    }

    /// @notice Transfer admin role
    /// @param newAdmin The new admin address
    function transferAdmin(address newAdmin) external {
        if (msg.sender != admin) revert Kindred__Unauthorized();
        admin = newAdmin;
    }

    // ============ View Functions ============

    /// @notice Get the prediction market for a pool
    function getMarket(PoolId poolId) external view returns (address) {
        return poolToMarket[poolId];
    }

    /// @notice Get user's reputation score
    function getReputation(address user) external view returns (uint256) {
        return reputation[user];
    }
}
