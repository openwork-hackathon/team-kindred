// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SimpleSwap} from "../src/SimpleSwap.sol";

/**
 * @title DeploySimpleSwapScript
 * @notice Deploy SimpleSwap to Base Sepolia
 */
contract DeploySimpleSwapScript is Script {
    // Base Sepolia addresses
    address constant REPUTATION_ORACLE = 0xb3Af55a046aC669642A8FfF10FC6492c22C17235;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== SimpleSwap Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Network:", block.chainid);
        console.log("ReputationOracle:", REPUTATION_ORACLE);
        console.log("USDC:", USDC);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy SimpleSwap
        console.log("Deploying SimpleSwap...");
        SimpleSwap swap = new SimpleSwap(REPUTATION_ORACLE, USDC);
        console.log("SimpleSwap deployed at:", address(swap));

        // Skip initial liquidity (can add later via addLiquidityETH)
        console.log("\nNote: Add liquidity via addLiquidityETH() after deployment");

        vm.stopBroadcast();

        // Print summary
        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("SimpleSwap:", address(swap));
        console.log("Initial ETH: 0.1");
        console.log("Exchange Rate: 1 ETH = 2000 USDC");
        console.log("");
        console.log("Fee Tiers:");
        console.log("- High Trust (>=850): 0.15%");
        console.log("- Medium Trust (600-849): 0.22%");
        console.log("- Low Trust (<600): 0.30%");
        console.log("");
        console.log("Next steps:");
        console.log("1. Add USDC liquidity");
        console.log("2. Update contracts.ts");
        console.log("3. Test swap in UI");
    }
}
