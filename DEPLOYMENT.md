# Kindred Contract Deployment Guide

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install Foundry (if not already)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Set up environment variables
cp .env.example .env
# Edit .env and add:
# - PRIVATE_KEY (deployer wallet)
# - BASE_SEPOLIA_RPC_URL
# - BASESCAN_API_KEY (for verification)
```

### 2. Deploy Contracts

```bash
# Navigate to contracts directory
cd packages/contracts

# Deploy to Base Sepolia (testnet)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv

# Deploy to Base (mainnet) - when ready
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### 3. Update Frontend Config

After deployment, copy the contract addresses to `src/lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  baseSepolia: {
    kindToken: {
      address: '0xYOUR_KIND_TOKEN_ADDRESS',
      abi: KindTokenABI,
    },
    kindredComment: {
      address: '0xYOUR_KINDRED_COMMENT_ADDRESS',
      abi: KindredCommentABI,
    },
  },
}
```

### 4. Test Integration

Run the example page:

```bash
# Navigate to root
cd ../..

# Run dev server
npm run dev

# Visit http://localhost:3000/examples/contract-integration
```

## 📝 Contract Addresses

### Base Sepolia (Testnet)

| Contract       | Address | Explorer |
|----------------|---------|----------|
| KindToken      | TBD     | [View]() |
| KindredComment | TBD     | [View]() |

### Base (Mainnet)

| Contract       | Address | Explorer |
|----------------|---------|----------|
| KindToken      | TBD     | [View]() |
| KindredComment | TBD     | [View]() |

## 🔧 Development Workflow

### Running Tests

```bash
cd packages/contracts

# Run all tests
forge test

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test testCreateComment
```

### Local Testing with Anvil

```bash
# Terminal 1: Start local chain
anvil

# Terminal 2: Deploy to local chain
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast

# Update frontend to use localhost:8545
```

### Verify Contracts Manually

```bash
# If auto-verification fails
forge verify-contract \
  --chain-id 84532 \
  --num-of-optimizations 200 \
  --compiler-version v0.8.24 \
  --constructor-args $(cast abi-encode "constructor(address,address)" $KIND_TOKEN $TREASURY) \
  $CONTRACT_ADDRESS \
  src/KindredComment.sol:KindredComment \
  --etherscan-api-key $BASESCAN_API_KEY
```

## 🔐 Security Checklist

Before mainnet deployment:

- [ ] All tests passing (`forge test`)
- [ ] Gas optimizations reviewed (`forge test --gas-report`)
- [ ] Security audit completed (by Patrick/Trail of Bits)
- [ ] Multisig setup for treasury
- [ ] Rate limits configured
- [ ] Emergency pause mechanism tested
- [ ] Upgrade path documented (if applicable)

## 📊 Gas Benchmarks

| Function       | Gas Used | Notes |
|----------------|----------|-------|
| createComment  | ~350k    | Includes NFT mint + stake |
| upvote         | ~500k    | First vote for user |
| downvote       | ~500k    | First vote for user |
| unlockPremium  | ~520k    | Includes reward distribution |

## 🐛 Troubleshooting

### "Insufficient stake" error

- Minimum stake is 100 KIND tokens
- Check balance with `useKindBalance(address)`
- Approve contract with `useApproveKind()`

### "TransferFailed" error

- Ensure you've approved KindredComment contract
- Check allowance with `useKindAllowance(address)`
- Approve max: `approveMax()`

### Transaction pending forever

- Check Base Sepolia status: https://sepolia.basescan.org/
- Try increasing gas price
- Use `useWaitForTransactionReceipt({ hash })` hook

## 📚 Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Base Docs](https://docs.base.org/)
- [Wagmi Docs](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/)

## 🔗 Useful Commands

```bash
# Get contract size
forge build --sizes

# Generate ABI
forge inspect KindredComment abi > abi.json

# Estimate gas
forge test --gas-report

# Coverage
forge coverage

# Format code
forge fmt
```

---

**Next Steps:**
1. Deploy to Base Sepolia ✅
2. Test with real wallet
3. Get faucet tokens (KIND)
4. Create demo video
5. Deploy to Base mainnet (after audit)
