# 🧪 On-Chain Voting Test Guide

**Status:** ✅ Code complete, ready for testing
**Tester:** JhiNResH
**Estimated time:** 10-15 minutes

---

## Prerequisites

1. **Wallet Setup**
   - MetaMask connected to Base Sepolia
   - Address: `0x872989F7fCd4048acA370161989d3904E37A3cB3` (or test wallet)
   - Has ETH for gas fees
   
2. **Token Balance**
   - Need KIND tokens for staking
   - Contract: `0xf0b5477386810559e3e8c03f10dd10b0a9222b2a`
   - Check balance: Go to https://sepolia.basescan.org/address/YOUR_ADDRESS

3. **Contracts Deployed**
   - ✅ KindToken: `0xf0b5477386810559e3e8c03f10dd10b0a9222b2a`
   - ✅ KindredComment: `0xb3bb93089404ce4c2f64535e5d513093625fedc8`

---

## Test Flow

### 1. Create a Test Review

**URL:** `http://localhost:3000/review`

**Steps:**
1. Connect wallet (RainbowKit button)
2. Select a project (e.g., "Uniswap")
3. Write a review
4. Select stake amount (try "5 KIND")
5. Click "Submit Review"
6. **Approve KIND tokens** (first transaction)
7. **Mint NFT** (second transaction)
8. Wait for confirmation

**Expected Result:**
- ✅ Two transactions confirmed on Basescan
- ✅ Review appears on feed
- ✅ NFT minted (check on Basescan under your address → "Token Holdings" → ERC-721)

---

### 2. Vote on Review (Upvote)

**URL:** Review feed or project page

**Steps:**
1. Find your review (or any review)
2. Click the **⬆️ Upvote** button
3. Select stake amount (try "1 KIND")
4. Click "Confirm Vote"
5. **Approve KIND tokens** (if not enough allowance)
6. **Submit vote transaction**
7. Wait for confirmation

**Expected Result:**
- ✅ Score increases (+1 to +10 depending on stake)
- ✅ Transaction confirmed on Basescan
- ✅ Button shows "voted" state (green)

---

### 3. Vote on Review (Downvote)

**Steps:**
1. Find a different review
2. Click the **⬇️ Downvote** button
3. Select stake amount (try "1 KIND")
4. Confirm and sign transaction
5. Wait for confirmation

**Expected Result:**
- ✅ Score decreases
- ✅ Transaction confirmed on Basescan

---

## What to Check

### ✅ Success Indicators

1. **Transactions Confirmed**
   - Check Basescan for each transaction
   - Should see `createComment`, `upvote`, `downvote` function calls

2. **Balances Updated**
   - KIND balance decreases after staking
   - Check on Basescan: Token balances

3. **UI Updates**
   - Score updates immediately after confirmation
   - Buttons show voted state
   - Toast notifications appear

4. **NFT Minted**
   - Check "Token Holdings" on Basescan
   - Should see new ERC-721 from KindredComment contract
   - Token ID matches your review

---

## Common Issues & Fixes

### ❌ "Insufficient Allowance"
**Fix:** Approve more KIND tokens
- Click "Approve" button again
- Enter higher amount (e.g., 100 KIND)

### ❌ "Transaction Failed"
**Fix:** Check gas and balance
- Need ETH for gas
- Need KIND for staking
- Try lower stake amount

### ❌ "MetaMask not responding"
**Fix:** Reload page
- Sometimes MetaMask needs refresh
- Reconnect wallet

### ❌ "Contract not found"
**Fix:** Switch to Base Sepolia
- Check network in MetaMask
- Should be "Base Sepolia" not "Ethereum Mainnet"

---

## Test Results Template

**Copy this and report back:**

```markdown
## Test Results (YYYY-MM-DD)

### Create Review
- [ ] Approve KIND successful
- [ ] Mint NFT successful
- [ ] Review appears on feed
- [ ] NFT visible on Basescan
- Transaction: 0x...

### Upvote
- [ ] Approve KIND successful (or skipped if already approved)
- [ ] Vote transaction successful
- [ ] Score updated correctly
- [ ] UI reflects voted state
- Transaction: 0x...

### Downvote
- [ ] Approve KIND successful
- [ ] Vote transaction successful
- [ ] Score updated correctly
- Transaction: 0x...

### Issues Found
- (List any bugs or UX problems)

### Screenshots
- (Attach if helpful)
```

---

## Debug Commands

If something goes wrong, run these in browser console:

```javascript
// Check wallet connection
window.ethereum?.selectedAddress

// Check network
window.ethereum?.chainId // Should be "0x14a34" (Base Sepolia)

// Check contract call (paste in console)
fetch('/api/balance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: 'YOUR_ADDRESS' })
}).then(r => r.json()).then(console.log)
```

---

## Contract Verification

You can verify transactions directly on Basescan:

### Check Comment Created
```
https://sepolia.basescan.org/tx/YOUR_TX_HASH
```

Look for:
- Event: `CommentCreated`
- Args: `tokenId`, `author`, `stakeAmount`

### Check Vote
```
https://sepolia.basescan.org/tx/YOUR_TX_HASH
```

Look for:
- Event: `CommentUpvoted` or `CommentDownvoted`
- Args: `tokenId`, `voter`, `stakeAmount`

---

## When You're Done

Report back in Discord:

```
✅ Task #6 Complete - On-Chain Voting Tested

Results:
- Create Review: ✅ / ❌
- Upvote: ✅ / ❌
- Downvote: ✅ / ❌

Transactions:
- Create: 0x...
- Upvote: 0x...
- Downvote: 0x...

Issues: (if any)
```

---

**Patrick Collins 🛡️**
*Let's get this tested!* 🚀
