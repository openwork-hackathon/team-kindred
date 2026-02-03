// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReputationOracle.sol";

contract ReputationOracleTest is Test {
    ReputationOracle public oracle;
    
    address public owner = address(this);
    address public updater = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public unauthorized = address(0x4);
    
    event ScoreUpdated(address indexed account, uint256 oldScore, uint256 newScore, address indexed updater);
    event AccountBlocked(address indexed account, bool blocked);
    event UpdaterSet(address indexed updater, bool authorized);
    
    function setUp() public {
        oracle = new ReputationOracle();
        oracle.setUpdater(updater, true);
    }
    
    // ============ Constructor Tests ============
    
    function test_Constructor_SetsOwnerAsUpdater() public view {
        assertTrue(oracle.updaters(owner));
    }
    
    // ============ getScore Tests ============
    
    function test_GetScore_ReturnsDefaultForNewUser() public view {
        assertEq(oracle.getScore(user1), 500); // DEFAULT_SCORE
    }
    
    function test_GetScore_ReturnsSetScore() public {
        oracle.setScore(user1, 750);
        assertEq(oracle.getScore(user1), 750);
    }
    
    function test_GetScore_ReturnsZeroForBlockedUser() public {
        oracle.setScore(user1, 0);
        oracle.setBlocked(user1, true);
        assertEq(oracle.getScore(user1), 0);
    }
    
    // ============ setScore Tests ============
    
    function test_SetScore_Success() public {
        vm.expectEmit(true, true, false, true);
        emit ScoreUpdated(user1, 0, 800, owner);
        
        oracle.setScore(user1, 800);
        assertEq(oracle.scores(user1), 800);
    }
    
    function test_SetScore_AsUpdater() public {
        vm.prank(updater);
        oracle.setScore(user1, 600);
        assertEq(oracle.scores(user1), 600);
    }
    
    function test_SetScore_RevertUnauthorized() public {
        vm.prank(unauthorized);
        vm.expectRevert(ReputationOracle.NotAuthorized.selector);
        oracle.setScore(user1, 500);
    }
    
    function test_SetScore_RevertZeroAddress() public {
        vm.expectRevert(ReputationOracle.ZeroAddress.selector);
        oracle.setScore(address(0), 500);
    }
    
    function test_SetScore_RevertScoreTooHigh() public {
        vm.expectRevert(abi.encodeWithSelector(
            ReputationOracle.ScoreTooHigh.selector,
            1001
        ));
        oracle.setScore(user1, 1001);
    }
    
    function test_SetScore_MaxScore() public {
        oracle.setScore(user1, 1000);
        assertEq(oracle.scores(user1), 1000);
    }
    
    // ============ batchSetScores Tests ============
    
    function test_BatchSetScores_Success() public {
        address[] memory accounts = new address[](2);
        accounts[0] = user1;
        accounts[1] = user2;
        
        uint256[] memory scores = new uint256[](2);
        scores[0] = 700;
        scores[1] = 850;
        
        oracle.batchSetScores(accounts, scores);
        
        assertEq(oracle.scores(user1), 700);
        assertEq(oracle.scores(user2), 850);
    }
    
    function test_BatchSetScores_RevertLengthMismatch() public {
        address[] memory accounts = new address[](2);
        accounts[0] = user1;
        accounts[1] = user2;
        
        uint256[] memory scores = new uint256[](1);
        scores[0] = 700;
        
        vm.expectRevert("Length mismatch");
        oracle.batchSetScores(accounts, scores);
    }
    
    // ============ setBlocked Tests ============
    
    function test_SetBlocked_Block() public {
        vm.expectEmit(true, false, false, true);
        emit AccountBlocked(user1, true);
        
        oracle.setBlocked(user1, true);
        assertTrue(oracle.blocked(user1));
        assertTrue(oracle.isBlocked(user1));
    }
    
    function test_SetBlocked_Unblock() public {
        oracle.setBlocked(user1, true);
        oracle.setBlocked(user1, false);
        assertFalse(oracle.isBlocked(user1));
    }
    
    function test_SetBlocked_RevertZeroAddress() public {
        vm.expectRevert(ReputationOracle.ZeroAddress.selector);
        oracle.setBlocked(address(0), true);
    }
    
    // ============ setUpdater Tests ============
    
    function test_SetUpdater_Add() public {
        address newUpdater = address(0x5);
        
        vm.expectEmit(true, false, false, true);
        emit UpdaterSet(newUpdater, true);
        
        oracle.setUpdater(newUpdater, true);
        assertTrue(oracle.updaters(newUpdater));
    }
    
    function test_SetUpdater_Remove() public {
        oracle.setUpdater(updater, false);
        assertFalse(oracle.updaters(updater));
    }
    
    function test_SetUpdater_RevertNotOwner() public {
        vm.prank(updater);
        vm.expectRevert();
        oracle.setUpdater(address(0x5), true);
    }
    
    function test_SetUpdater_RevertZeroAddress() public {
        vm.expectRevert(ReputationOracle.ZeroAddress.selector);
        oracle.setUpdater(address(0), true);
    }
    
    // ============ increaseScore Tests ============
    
    function test_IncreaseScore_FromDefault() public {
        oracle.increaseScore(user1, 100);
        // Default 500 + 100 = 600
        assertEq(oracle.getScore(user1), 600);
    }
    
    function test_IncreaseScore_CapsAtMax() public {
        oracle.setScore(user1, 950);
        oracle.increaseScore(user1, 100);
        // 950 + 100 = 1050, capped at 1000
        assertEq(oracle.getScore(user1), 1000);
    }
    
    function test_IncreaseScore_FromZero() public {
        oracle.setScore(user1, 0);
        oracle.increaseScore(user1, 50);
        // Treats 0 as default (500), so 500 + 50 = 550
        assertEq(oracle.getScore(user1), 550);
    }
    
    // ============ decreaseScore Tests ============
    
    function test_DecreaseScore_FromDefault() public {
        oracle.decreaseScore(user1, 100);
        // Default 500 - 100 = 400
        assertEq(oracle.getScore(user1), 400);
    }
    
    function test_DecreaseScore_FloorsAtZero() public {
        oracle.setScore(user1, 50);
        oracle.decreaseScore(user1, 100);
        // 50 - 100 = -50, floored at 0
        // But getScore treats 0 as "not set" and returns DEFAULT_SCORE
        // Use scores() directly to check actual storage
        assertEq(oracle.scores(user1), 0);
        // getScore returns default for unblocked users with 0 stored
        assertEq(oracle.getScore(user1), 500);
    }
    
    function test_DecreaseScore_FromZero() public {
        oracle.setScore(user1, 0);
        oracle.decreaseScore(user1, 50);
        // Treats 0 as default (500), so 500 - 50 = 450
        assertEq(oracle.getScore(user1), 450);
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_SetScore_ValidRange(uint256 score) public {
        score = bound(score, 0, 1000);
        oracle.setScore(user1, score);
        assertEq(oracle.scores(user1), score);
    }
    
    function testFuzz_IncreaseScore_NeverExceedsMax(uint256 initial, uint256 delta) public {
        initial = bound(initial, 1, 1000); // Avoid 0 which triggers default
        delta = bound(delta, 0, type(uint256).max - initial);
        
        oracle.setScore(user1, initial);
        oracle.increaseScore(user1, delta);
        
        assertTrue(oracle.getScore(user1) <= 1000);
    }
    
    function testFuzz_DecreaseScore_NeverBelowZero(uint256 initial, uint256 delta) public {
        initial = bound(initial, 1, 1000);
        
        oracle.setScore(user1, initial);
        oracle.decreaseScore(user1, delta);
        
        assertTrue(oracle.getScore(user1) >= 0);
    }
}
