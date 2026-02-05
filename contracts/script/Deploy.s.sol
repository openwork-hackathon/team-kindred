// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {KindToken} from "../src/KindToken.sol";
import {KindredComment} from "../src/KindredComment.sol";

/**
 * @title DeployScript
 * @notice Foundry script to deploy Kindred contracts to Base Sepolia
 * @dev Run with: forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast
 */
contract DeployScript is Script {
    function run() external {
        // Load deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Treasury = deployer for now (can be changed later)
        address treasury = deployer;

        console.log("=== Kindred Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Treasury:", treasury);
        console.log("Network:", block.chainid);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy KindToken (ERC-20)
        console.log("Deploying KindToken...");
        KindToken kindToken = new KindToken(deployer);
        console.log("KindToken deployed at:", address(kindToken));
        console.log("Initial supply minted to deployer");

        // 2. Deploy KindredComment (ERC-721 + x402)
        console.log("Deploying KindredComment...");
        KindredComment kindredComment = new KindredComment(
            address(kindToken),
            treasury
        );
        console.log("KindredComment deployed at:", address(kindredComment));

        vm.stopBroadcast();

        // Print summary
        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("Network:", block.chainid);
        console.log("KindToken:", address(kindToken));
        console.log("KindredComment:", address(kindredComment));
        console.log("Treasury:", treasury);
        console.log("");
        console.log("Next steps:");
        console.log("1. Update src/lib/contracts.ts with these addresses");
        console.log("2. Test on frontend (pnpm dev)");
        console.log("3. Record demo video");
        console.log("4. Submit to USDC Hackathon");
    }
}
