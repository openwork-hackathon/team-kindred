// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {KindToken} from "../src/KindToken.sol";
import {KindredComment} from "../src/KindredComment.sol";

/**
 * @title DeployScript
 * @notice Deploys KindToken and KindredComment contracts
 * @dev Usage: forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast --verify
 */
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address treasury = vm.envOr("TREASURY_ADDRESS", deployer); // Use deployer as treasury if not set

        console.log("Deploying contracts with account:", deployer);
        console.log("Treasury address:", treasury);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy KindToken
        KindToken kindToken = new KindToken(deployer); // Initial holder = deployer
        console.log("KindToken deployed at:", address(kindToken));

        // 2. Deploy KindredComment
        KindredComment kindredComment = new KindredComment(address(kindToken), treasury);
        console.log("KindredComment deployed at:", address(kindredComment));

        vm.stopBroadcast();

        // Print deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network:", block.chainid);
        console.log("KindToken:", address(kindToken));
        console.log("KindredComment:", address(kindredComment));
        console.log("Treasury:", treasury);
        console.log("\nUpdate src/lib/contracts.ts with these addresses!");
    }
}
