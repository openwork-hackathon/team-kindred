# 🚀 Kindred Smart Contracts Deployment Guide

**Status:** 🔴 BLOCKER - 等待 JhiNResH 提供 PRIVATE_KEY

**Deadline:** ASAP (USDC Hackathon: Feb 8, Clawathon: ~Feb 10)

---

## ⚡ Quick Deploy (For JhiNResH)

### 1️⃣ Prerequisites

You need:
- ✅ Private key of wallet with ETH on Base Sepolia
- ✅ [Basescan API key](https://basescan.org/myapikey) (for contract verification)

Get testnet ETH:
- [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

### 2️⃣ Deploy Command

```bash
cd /Users/jhinresh/clawd/team-kindred/packages/contracts

# Set environment variables
export PRIVATE_KEY="your-private-key-here"
export RPC_URL="https://sepolia.base.org"
export ETHERSCAN_API_KEY="your-basescan-api-key" # Optional, for verification

# Deploy (with verification)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  -vvv

# Or deploy without verification (faster)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --broadcast \
  -vvv
```

### 3️⃣ Copy Contract Addresses

After deployment, you'll see output like:

```
=== Deployment Summary ===
Network: 84532
KindToken: 0xABCD1234...
KindredComment: 0xEFGH5678...
Treasury: 0x...
```

### 4️⃣ Update Frontend Config

Edit `src/lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  baseSepolia: {
    kindToken: {
      address: '0xABCD1234...' as `0x${string}`, // ← Paste KindToken address here
      abi: KindTokenABI,
    },
    kindredComment: {
      address: '0xEFGH5678...' as `0x${string}`, // ← Paste KindredComment address here
      abi: KindredCommentABI,
    },
  },
  // ...
}
```

### 5️⃣ Test On-Chain

```bash
# Test locally
cd /Users/jhinresh/clawd/team-kindred
pnpm dev

# Visit http://localhost:3000
# Connect wallet → Try minting a review
```

---

## 🔍 What Gets Deployed

| Contract | Purpose | Functions |
|----------|---------|-----------|
| **KindToken** | ERC-20 governance token | Transfer, approve, permit |
| **KindredComment** | ERC-721 NFT review system | Mint review (pay-to-comment), upvote/downvote, unlock premium content (x402) |

### Contract Addresses (After Deployment)

**Base Sepolia (Testnet):**
- KindToken: `TBD` ⬅️ Update after deployment
- KindredComment: `TBD` ⬅️ Update after deployment

**Base (Mainnet):**
- Not deployed yet (deploy after testnet success)

---

## 🧪 Testing Checklist

After deployment, verify:

- [ ] KindToken deployed successfully
- [ ] KindredComment deployed successfully
- [ ] Frontend connects to contracts (no errors in console)
- [ ] Can mint a review (stake tokens)
- [ ] Can upvote/downvote (with stake)
- [ ] Balances update correctly
- [ ] Transactions show on [Basescan](https://sepolia.basescan.org/)

---

## 🆘 Troubleshooting

### "Insufficient funds"
- Get testnet ETH from [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

### "Invalid private key"
- Make sure PRIVATE_KEY has no `0x` prefix
- Check key is correct (test with `cast wallet address --private-key $PRIVATE_KEY`)

### "Contract verification failed"
- Don't worry, verification is optional
- Deploy without `--verify` flag for faster deployment
- Can verify later with `forge verify-contract`

### "RPC error"
- Try different RPC:
  - `https://sepolia.base.org` (official)
  - `https://base-sepolia.blockpi.network/v1/rpc/public` (alternative)

---

## 📝 Post-Deployment Tasks

Once deployed, notify Steve:

```
✅ Contracts deployed to Base Sepolia:
- KindToken: 0x...
- KindredComment: 0x...

Please update src/lib/contracts.ts and test on-chain transactions.
```

---

## 🎯 Why This Is Urgent

**Timeline:**
- **USDC Hackathon:** Feb 8 (3.5 days away)
- **Clawathon:** ~Feb 10 (6.5 days away)

**Blockers:**
- ✅ UI integration complete (PR #42, #45)
- ✅ Contract code ready (20 tests passing)
- 🔴 **Cannot test on-chain without deployment**
- 🔴 **Cannot record demo without working product**

**Impact:**
- Without deployment: No demo → No submission → No prize
- With deployment: Full demo → Strong submission → High chance of winning

---

*Created by Steve @ 2026-02-05 00:15 PST*
