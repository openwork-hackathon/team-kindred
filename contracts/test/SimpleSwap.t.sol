// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SimpleSwap.sol";
import "../src/ReputationOracle.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract SimpleSwapTest is Test {
    SimpleSwap public swap;
    ReputationOracle public oracle;
    MockUSDC public usdc;
    
    address public owner = address(this);
    address public highTrustUser = address(0x1);
    address public mediumTrustUser = address(0x2);
    address public lowTrustUser = address(0x3);
    address public blockedUser = address(0x4);
    
    function setUp() public {
        // Deploy contracts
        oracle = new ReputationOracle();
        usdc = new MockUSDC();
        swap = new SimpleSwap(address(oracle), address(usdc));
        
        // Set reputation scores
        oracle.setScore(highTrustUser, 900);
        oracle.setScore(mediumTrustUser, 700);
        oracle.setScore(lowTrustUser, 500);
        oracle.setScore(blockedUser, 50);
        
        // Add liquidity
        vm.deal(address(swap), 100 ether);
        usdc.transfer(address(swap), 200000 * 10**6); // 200k USDC
    }
    
    function test_SwapETHForUSDC_HighTrust() public {
        vm.deal(highTrustUser, 1 ether);
        
        vm.startPrank(highTrustUser);
        
        uint256 ethAmount = 1 ether;
        uint256 expectedOutput = (ethAmount * 2000 * 10**6) / 1e18; // 2000 USDC
        uint256 fee = (expectedOutput * 15) / 10000; // 0.15%
        uint256 expectedNet = expectedOutput - fee;
        
        uint256 amountOut = swap.swapETHForUSDC{value: ethAmount}(0);
        
        assertEq(amountOut, expectedNet);
        assertEq(usdc.balanceOf(highTrustUser), expectedNet);
        
        vm.stopPrank();
    }
    
    function test_SwapETHForUSDC_MediumTrust() public {
        vm.deal(mediumTrustUser, 1 ether);
        
        vm.startPrank(mediumTrustUser);
        
        uint256 ethAmount = 1 ether;
        uint256 expectedOutput = (ethAmount * 2000 * 10**6) / 1e18;
        uint256 fee = (expectedOutput * 22) / 10000; // 0.22%
        uint256 expectedNet = expectedOutput - fee;
        
        uint256 amountOut = swap.swapETHForUSDC{value: ethAmount}(0);
        
        assertEq(amountOut, expectedNet);
        
        vm.stopPrank();
    }
    
    function test_SwapETHForUSDC_LowTrust() public {
        vm.deal(lowTrustUser, 1 ether);
        
        vm.startPrank(lowTrustUser);
        
        uint256 ethAmount = 1 ether;
        uint256 expectedOutput = (ethAmount * 2000 * 10**6) / 1e18;
        uint256 fee = (expectedOutput * 30) / 10000; // 0.30%
        uint256 expectedNet = expectedOutput - fee;
        
        uint256 amountOut = swap.swapETHForUSDC{value: ethAmount}(0);
        
        assertEq(amountOut, expectedNet);
        
        vm.stopPrank();
    }
    
    function test_SwapETHForUSDC_BlockedUser() public {
        vm.deal(blockedUser, 1 ether);
        
        vm.startPrank(blockedUser);
        
        vm.expectRevert(
            abi.encodeWithSelector(
                SimpleSwap.InsufficientReputation.selector,
                50,
                100
            )
        );
        swap.swapETHForUSDC{value: 1 ether}(0);
        
        vm.stopPrank();
    }
    
    function test_SwapUSDCForETH() public {
        usdc.transfer(highTrustUser, 2000 * 10**6);
        vm.deal(highTrustUser, 0);
        
        vm.startPrank(highTrustUser);
        
        uint256 usdcAmount = 2000 * 10**6; // 2000 USDC
        uint256 expectedOutput = (usdcAmount * 1e18) / (2000 * 10**6); // 1 ETH
        uint256 fee = (expectedOutput * 15) / 10000; // 0.15%
        uint256 expectedNet = expectedOutput - fee;
        
        usdc.approve(address(swap), usdcAmount);
        uint256 amountOut = swap.swapUSDCForETH(usdcAmount, 0);
        
        assertEq(amountOut, expectedNet);
        assertEq(highTrustUser.balance, expectedNet);
        
        vm.stopPrank();
    }
    
    function test_GetSwapOutput() public view {
        (uint256 amountOut, uint256 fee, uint256 feeBps, uint256 reputation) = 
            swap.getSwapOutput(highTrustUser, true, 1 ether);
        
        assertEq(reputation, 900);
        assertEq(feeBps, 15);
        assertTrue(amountOut > 0);
        assertTrue(fee > 0);
    }
    
    function test_CanTrade() public view {
        assertTrue(swap.canTrade(highTrustUser));
        assertTrue(swap.canTrade(mediumTrustUser));
        assertTrue(swap.canTrade(lowTrustUser));
        assertFalse(swap.canTrade(blockedUser));
    }
    
    function test_CalculateFee() public view {
        assertEq(swap.calculateFee(900), 15);
        assertEq(swap.calculateFee(700), 22);
        assertEq(swap.calculateFee(500), 30);
    }
    
    function test_SlippageProtection() public {
        vm.deal(highTrustUser, 1 ether);
        
        vm.startPrank(highTrustUser);
        
        uint256 minAmountOut = 3000 * 10**6; // Require 3000 USDC (impossible)
        
        vm.expectRevert(SimpleSwap.SlippageExceeded.selector);
        swap.swapETHForUSDC{value: 1 ether}(minAmountOut);
        
        vm.stopPrank();
    }
}
