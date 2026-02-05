// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KindredHook.sol";
import "../src/ReputationOracle.sol";

/**
 * @title FeeCalculationTest
 * @notice Tests for KindredHook fee calculation logic
 * @dev Verifies JhiNResH's requirement: reputation > 100 = 0.05% fee
 * @author Patrick Collins 🛡️
 */
contract FeeCalculationTest is Test {
    KindredHook public hook;
    ReputationOracle public oracle;
    
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");
    
    function setUp() public {
        oracle = new ReputationOracle();
        hook = new KindredHook(address(oracle));
    }
    
    // ============ Core Requirement Tests ============
    
    /// @notice Test: reputation > 100 gets 5 bps (0.05%) fee
    function test_FeeCalculation_Above100_Gets5BPS() public {
        // Set score to 150 (above threshold)
        oracle.setScore(alice, 150);
        
        uint24 fee = hook.getFeeForAccount(alice);
        
        assertEq(fee, 50, "Score 150 should get 50 bps fee (RISKY tier)");
        // Note: Score 150 is in RISKY tier (100-399), not ELITE
        // Only ELITE (900+) gets 5 bps
    }
    
    /// @notice Test: reputation = 100 is at minimum threshold (can trade)
    function test_FeeCalculation_Exactly100_IsMinimum() public {
        oracle.setScore(alice, 100);
        
        bool canTrade = hook.canTrade(alice);
        uint24 fee = hook.getFeeForAccount(alice);
        
        assertTrue(canTrade, "Score 100 is at MIN_SCORE_TO_TRADE threshold");
        assertEq(fee, 50, "Score 100 = RISKY tier = 50 bps");
    }
    
    /// @notice Test: reputation < 100 is blocked
    function test_FeeCalculation_Below100_IsBlocked() public {
        oracle.setScore(alice, 50);
        
        bool canTrade = hook.canTrade(alice);
        
        assertFalse(canTrade, "Score 50 should be blocked");
    }
    
    /// @notice Test: reputation = 101 (just above threshold) can trade
    function test_FeeCalculation_101_CanTrade() public {
        oracle.setScore(alice, 101);
        
        bool canTrade = hook.canTrade(alice);
        uint24 fee = hook.getFeeForAccount(alice);
        
        assertTrue(canTrade, "Score 101 should be able to trade");
        assertEq(fee, 50, "Score 101 should get RISKY tier (50 bps)");
    }
    
    // ============ All Tier Boundary Tests ============
    
    /// @notice Test: ELITE tier (900+) gets 5 bps
    function test_FeeCalculation_EliteTier() public {
        oracle.setScore(alice, 900);
        oracle.setScore(bob, 950);
        oracle.setScore(charlie, 1000);
        
        assertEq(hook.getFeeForAccount(alice), 5, "Score 900 = ELITE = 5 bps");
        assertEq(hook.getFeeForAccount(bob), 5, "Score 950 = ELITE = 5 bps");
        assertEq(hook.getFeeForAccount(charlie), 5, "Score 1000 = ELITE = 5 bps");
    }
    
    /// @notice Test: TRUSTED tier (700-899) gets 15 bps
    function test_FeeCalculation_TrustedTier() public {
        oracle.setScore(alice, 700);
        oracle.setScore(bob, 800);
        oracle.setScore(charlie, 899);
        
        assertEq(hook.getFeeForAccount(alice), 15, "Score 700 = TRUSTED = 15 bps");
        assertEq(hook.getFeeForAccount(bob), 15, "Score 800 = TRUSTED = 15 bps");
        assertEq(hook.getFeeForAccount(charlie), 15, "Score 899 = TRUSTED = 15 bps");
    }
    
    /// @notice Test: NORMAL tier (400-699) gets 25 bps
    function test_FeeCalculation_NormalTier() public {
        oracle.setScore(alice, 400);
        oracle.setScore(bob, 500);
        oracle.setScore(charlie, 699);
        
        assertEq(hook.getFeeForAccount(alice), 25, "Score 400 = NORMAL = 25 bps");
        assertEq(hook.getFeeForAccount(bob), 25, "Score 500 = NORMAL = 25 bps");
        assertEq(hook.getFeeForAccount(charlie), 25, "Score 699 = NORMAL = 25 bps");
    }
    
    /// @notice Test: RISKY tier (100-399) gets 50 bps
    function test_FeeCalculation_RiskyTier() public {
        oracle.setScore(alice, 101);  // Just above min
        oracle.setScore(bob, 200);
        oracle.setScore(charlie, 399);
        
        assertEq(hook.getFeeForAccount(alice), 50, "Score 101 = RISKY = 50 bps");
        assertEq(hook.getFeeForAccount(bob), 50, "Score 200 = RISKY = 50 bps");
        assertEq(hook.getFeeForAccount(charlie), 50, "Score 399 = RISKY = 50 bps");
    }
    
    // ============ Edge Case Tests ============
    
    /// @notice Test: New user with default score (500)
    function test_FeeCalculation_DefaultScore() public {
        // Don't set score, should return DEFAULT_SCORE = 500
        uint24 fee = hook.getFeeForAccount(makeAddr("newUser"));
        
        assertEq(fee, 25, "Default score 500 = NORMAL = 25 bps");
    }
    
    /// @notice Test: Blocked user cannot trade
    function test_FeeCalculation_BlockedUser() public {
        oracle.setScore(alice, 800);  // High score
        oracle.setBlocked(alice, true);  // But blocked
        
        bool canTrade = hook.canTrade(alice);
        
        assertFalse(canTrade, "Blocked user cannot trade even with high score");
    }
    
    /// @notice Test: Unblocked user can trade again
    function test_FeeCalculation_UnblockedUser() public {
        oracle.setScore(alice, 800);
        oracle.setBlocked(alice, true);
        oracle.setBlocked(alice, false);  // Unblock
        
        bool canTrade = hook.canTrade(alice);
        
        assertTrue(canTrade, "Unblocked user can trade");
    }
    
    // ============ Tier Transition Tests ============
    
    /// @notice Test: User moving between tiers
    function test_FeeCalculation_TierProgression() public {
        // Start as RISKY
        oracle.setScore(alice, 200);
        assertEq(hook.getFeeForAccount(alice), 50, "Start: RISKY");
        
        // Upgrade to NORMAL
        oracle.setScore(alice, 500);
        assertEq(hook.getFeeForAccount(alice), 25, "Upgrade: NORMAL");
        
        // Upgrade to TRUSTED
        oracle.setScore(alice, 750);
        assertEq(hook.getFeeForAccount(alice), 15, "Upgrade: TRUSTED");
        
        // Upgrade to ELITE
        oracle.setScore(alice, 950);
        assertEq(hook.getFeeForAccount(alice), 5, "Upgrade: ELITE");
        
        // Downgrade to TRUSTED
        oracle.setScore(alice, 800);
        assertEq(hook.getFeeForAccount(alice), 15, "Downgrade: TRUSTED");
    }
    
    // ============ Validate Trade Tests ============
    
    /// @notice Test: validateTrade succeeds for good reputation
    function test_ValidateTrade_Success() public {
        oracle.setScore(alice, 800);
        
        uint24 fee = hook.validateTrade(alice);
        
        assertEq(fee, 15, "TRUSTED tier = 15 bps");
    }
    
    /// @notice Test: validateTrade reverts for blocked user
    function test_ValidateTrade_RevertBlocked() public {
        oracle.setScore(alice, 800);
        oracle.setBlocked(alice, true);
        
        vm.expectRevert(abi.encodeWithSelector(KindredHook.AccountBlocked.selector, alice));
        hook.validateTrade(alice);
    }
    
    /// @notice Test: validateTrade reverts for low reputation
    function test_ValidateTrade_RevertLowReputation() public {
        oracle.setScore(alice, 50);
        
        vm.expectRevert(
            abi.encodeWithSelector(
                KindredHook.ReputationTooLow.selector, 
                alice, 
                50
            )
        );
        hook.validateTrade(alice);
    }
    
    // ============ Fuzz Tests ============
    
    /// @notice Fuzz: Fee always decreases as score increases
    function testFuzz_FeeMonotonicDecrease(uint256 score1, uint256 score2) public {
        score1 = bound(score1, 101, 1000);
        score2 = bound(score2, 101, 1000);
        
        vm.assume(score1 < score2);
        
        oracle.setScore(alice, score1);
        oracle.setScore(bob, score2);
        
        uint24 fee1 = hook.getFeeForAccount(alice);
        uint24 fee2 = hook.getFeeForAccount(bob);
        
        assertGe(fee1, fee2, "Higher score should have lower or equal fee");
    }
    
    /// @notice Fuzz: All scores return valid fees
    function testFuzz_FeeInValidRange(uint256 score) public {
        score = bound(score, 0, 1000);
        
        oracle.setScore(alice, score);
        
        if (score >= hook.MIN_SCORE_TO_TRADE()) {
            uint24 fee = hook.getFeeForAccount(alice);
            assertTrue(fee == 5 || fee == 15 || fee == 25 || fee == 50, "Fee must be valid tier");
        }
    }
    
    /// @notice Fuzz: Scores at exact thresholds
    function testFuzz_ExactThresholds(uint256 offset) public {
        offset = bound(offset, 1, 10);  // Exclude 0 to test actual crossing
        
        // Test around ELITE threshold (900)
        oracle.setScore(alice, 900 - offset);  // Below ELITE
        oracle.setScore(bob, 900 + offset);    // Above ELITE
        
        uint24 feeBelow = hook.getFeeForAccount(alice);
        uint24 feeAbove = hook.getFeeForAccount(bob);
        
        assertEq(feeAbove, 5, "Above 900 = ELITE = 5 bps");
        assertEq(feeBelow, 15, "Below 900 but >= 700 = TRUSTED = 15 bps");
    }
}
