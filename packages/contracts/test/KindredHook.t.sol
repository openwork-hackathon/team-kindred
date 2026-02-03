// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindredHook.sol";

contract MockReputationOracle is IReputationOracle {
    mapping(address => uint256) public scores;
    mapping(address => bool) public blocked;
    
    function setScore(address account, uint256 score) external {
        scores[account] = score;
    }
    
    function setBlocked(address account, bool _isBlocked) external {
        blocked[account] = _isBlocked;
    }
    
    function getScore(address account) external view returns (uint256) {
        return scores[account];
    }
    
    function isBlocked(address account) external view returns (bool) {
        return blocked[account];
    }
}

contract KindredHookTest is Test {
    KindredHook public hook;
    MockReputationOracle public oracle;
    
    address public eliteUser = address(0x1);
    address public trustedUser = address(0x2);
    address public normalUser = address(0x3);
    address public riskyUser = address(0x4);
    address public blockedUser = address(0x5);
    address public lowScoreUser = address(0x6);
    
    function setUp() public {
        oracle = new MockReputationOracle();
        hook = new KindredHook(address(oracle));
        
        // Setup test users with different reputation scores
        oracle.setScore(eliteUser, 950);      // Elite tier
        oracle.setScore(trustedUser, 750);    // Trusted tier
        oracle.setScore(normalUser, 500);     // Normal tier
        oracle.setScore(riskyUser, 200);      // Risky tier
        oracle.setScore(lowScoreUser, 50);    // Below minimum
        oracle.setScore(blockedUser, 800);    // High score but blocked
        oracle.setBlocked(blockedUser, true);
    }
    
    // ============ Fee Calculation Tests ============
    
    function test_CalculateFee_Elite() public view {
        assertEq(hook.calculateFee(950), 10);  // 0.1%
        assertEq(hook.calculateFee(900), 10);  // Boundary
        assertEq(hook.calculateFee(1000), 10); // Max score
    }
    
    function test_CalculateFee_Trusted() public view {
        assertEq(hook.calculateFee(750), 20);  // 0.2%
        assertEq(hook.calculateFee(700), 20);  // Boundary
        assertEq(hook.calculateFee(899), 20);  // Just below elite
    }
    
    function test_CalculateFee_Normal() public view {
        assertEq(hook.calculateFee(500), 30);  // 0.3%
        assertEq(hook.calculateFee(400), 30);  // Boundary
        assertEq(hook.calculateFee(699), 30);  // Just below trusted
    }
    
    function test_CalculateFee_Risky() public view {
        assertEq(hook.calculateFee(200), 50);  // 0.5%
        assertEq(hook.calculateFee(0), 50);    // Zero score
        assertEq(hook.calculateFee(399), 50);  // Just below normal
    }
    
    // ============ Account Fee Tests ============
    
    function test_GetFeeForAccount_AllTiers() public view {
        assertEq(hook.getFeeForAccount(eliteUser), 10);
        assertEq(hook.getFeeForAccount(trustedUser), 20);
        assertEq(hook.getFeeForAccount(normalUser), 30);
        assertEq(hook.getFeeForAccount(riskyUser), 50);
    }
    
    // ============ Can Trade Tests ============
    
    function test_CanTrade_ValidUsers() public view {
        assertTrue(hook.canTrade(eliteUser));
        assertTrue(hook.canTrade(trustedUser));
        assertTrue(hook.canTrade(normalUser));
        assertTrue(hook.canTrade(riskyUser));  // Low score but above minimum
    }
    
    function test_CanTrade_BlockedUser() public view {
        assertFalse(hook.canTrade(blockedUser));
    }
    
    function test_CanTrade_LowScore() public view {
        assertFalse(hook.canTrade(lowScoreUser));
    }
    
    // ============ Validate Trade Tests ============
    
    function test_ValidateTrade_Success() public view {
        uint24 fee = hook.validateTrade(eliteUser);
        assertEq(fee, 10);
    }
    
    function test_ValidateTrade_RevertBlocked() public {
        vm.expectRevert(abi.encodeWithSelector(
            KindredHook.AccountBlocked.selector,
            blockedUser
        ));
        hook.validateTrade(blockedUser);
    }
    
    function test_ValidateTrade_RevertLowScore() public {
        vm.expectRevert(abi.encodeWithSelector(
            KindredHook.ReputationTooLow.selector,
            lowScoreUser,
            50
        ));
        hook.validateTrade(lowScoreUser);
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_CalculateFee_AlwaysReturnsValidFee(uint256 score) public view {
        uint24 fee = hook.calculateFee(score);
        assertTrue(fee == 10 || fee == 20 || fee == 30 || fee == 50);
    }
    
    function testFuzz_CalculateFee_MonotonicDecrease(uint256 score1, uint256 score2) public view {
        // Higher score should result in same or lower fee
        if (score1 >= score2) {
            assertTrue(hook.calculateFee(score1) <= hook.calculateFee(score2));
        }
    }
}
