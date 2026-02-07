# 🧪 x402 Payment Flow - E2E Test Script

**Tester:** Patrick Collins 🛡️  
**Date:** 2026-02-06  
**Environment:** Base Sepolia Testnet  

---

## Pre-requisites

1. ✅ Wallet with Base Sepolia ETH (for gas)
2. ✅ Wallet with USDC (Base Sepolia testnet)
3. ✅ Privy wallet connected
4. ✅ App deployed to Vercel

**USDC Faucet (Base Sepolia):**
- Contract: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Get testnet USDC: https://faucet.circle.com/

---

## Test Case 1: First-time Unlock (Happy Path)

### Step 1: Navigate to Restaurant
```
URL: https://[VERCEL_URL]/k/gourmet/din-tai-fung
```

**Expected:**
- Restaurant page loads ✅
- Premium Insight section visible ✅
- Shows "Unlock for $0.10 USDC" button ✅

**Screenshot:** `test-1-locked-state.png`

---

### Step 2: Click Unlock Button

**Expected:**
- Privy wallet modal opens ✅
- Shows USDC approval request (if first time) ✅
- Or shows transfer request (if already approved) ✅

**Screenshot:** `test-2-wallet-modal.png`

---

### Step 3: Approve USDC (if needed)

**Transaction:**
- Function: `approve(address spender, uint256 amount)`
- Spender: Treasury `0x872989F7fCd4048acA370161989d3904E37A3cB3`
- Amount: `100000` (0.1 USDC, 6 decimals)

**Expected:**
- Approval transaction sent ✅
- Wait for confirmation ✅
- Button shows "Sending payment..." ✅

**BaseScan:** Record tx hash

---

### Step 4: Send Payment

**Transaction:**
- Function: `transfer(address to, uint256 amount)`
- To: Treasury `0x872989F7fCd4048acA370161989d3904E37A3cB3`
- Amount: `100000` (0.1 USDC)

**Expected:**
- Transfer transaction sent ✅
- Button shows "Verifying..." ✅

**BaseScan:** Record tx hash

---

### Step 5: Backend Verification

**API Call:**
```
POST /api/x402
{
  "contentId": "insight:din-tai-fung",
  "contentType": "gourmet-insight",
  "userAddress": "0x...",
  "txHash": "0x..."
}
```

**Expected:**
- Response 200 ✅
- `status: "unlocked"` ✅
- `content.report` contains InsightReport ✅

**Network Tab:** Record response

---

### Step 6: Content Unlock

**Expected:**
- PremiumInsight component shows full report ✅
- Sections visible:
  - Overall Score & Trend ✅
  - Best Time to Visit ✅
  - Value Rating ✅
  - Competition Rank ✅
  - Strengths & Weaknesses ✅
  - Recommendation ✅
- Button shows "Unlocked!" ✅

**Screenshot:** `test-6-unlocked-report.png`

---

### Step 7: Verify Persistence

**Action:** Reload page

**Expected:**
- Content still unlocked ✅
- No payment required ✅
- Report displays immediately ✅

---

## Test Case 2: Already Unlocked (Return User)

### Precondition
Same wallet already paid for this content

### Steps
1. Navigate to restaurant page
2. Check PremiumInsight component

**Expected:**
- Report displays immediately ✅
- No unlock button shown ✅
- No payment required ✅

---

## Test Case 3: Insufficient Balance

### Precondition
Wallet has < 0.1 USDC

### Steps
1. Click unlock button
2. Attempt payment

**Expected:**
- Transaction fails ✅
- Error message shows "Insufficient USDC balance" ✅
- Content stays locked ✅

---

## Test Case 4: Transaction Rejected

### Steps
1. Click unlock button
2. Wallet modal appears
3. Click "Reject"

**Expected:**
- Transaction cancelled ✅
- Error shows "Payment failed" ✅
- Content stays locked ✅
- Can retry ✅

---

## Test Case 5: Network Error

### Steps
1. Disconnect internet
2. Click unlock button
3. Reconnect after transaction attempt

**Expected:**
- Shows error message ✅
- Can retry when connected ✅

---

## Test Case 6: Gemini API Failure

### Precondition
Temporarily break Gemini API (remove key)

### Steps
1. Complete payment successfully
2. Backend generates report

**Expected:**
- Falls back to default report ✅
- Content still unlocks ✅
- User not charged again ✅

---

## Test Case 7: Different Restaurant

### Steps
1. Unlock "Din Tai Fung" (paid)
2. Navigate to "Shake Shack"
3. Check unlock status

**Expected:**
- "Shake Shack" is locked ✅
- Requires separate payment ✅
- "Din Tai Fung" remains unlocked ✅

---

## Test Case 8: Different Wallet

### Steps
1. Wallet A unlocks content
2. Connect Wallet B
3. Check unlock status

**Expected:**
- Wallet B sees locked content ✅
- Requires separate payment ✅

---

## Security Test Cases

### SEC-1: Fake Transaction Hash

**Attack:** Submit random txHash

**Expected:**
- ⚠️ Currently PASSES (bug!)
- Should: Verify on-chain and reject ❌

**Status:** Known issue (production blocker)

---

### SEC-2: Replay Attack

**Attack:** Use same txHash twice

**Expected:**
- Second attempt rejected ✅
- (Database unique constraint)

---

### SEC-3: Wrong Amount

**Attack:** Send 0.05 USDC instead of 0.10

**Expected:**
- ⚠️ Currently might PASS (bug!)
- Should: Verify amount and reject ❌

**Status:** Known issue (production blocker)

---

### SEC-4: Payment to Wrong Address

**Attack:** Send USDC to different address

**Expected:**
- ⚠️ Currently might PASS (bug!)
- Should: Verify recipient and reject ❌

**Status:** Known issue (production blocker)

---

## Performance Tests

### PERF-1: Report Generation Time

**Measure:** Time from payment to display

**Benchmark:**
- Payment confirmation: ~3-5 seconds
- Gemini API call: ~2-4 seconds
- Total: < 10 seconds ✅

**Target:** < 15 seconds

---

### PERF-2: Concurrent Unlocks

**Test:** 5 users unlock simultaneously

**Expected:**
- All succeed ✅
- No race conditions ✅
- Database handles concurrency ✅

---

## UI/UX Tests

### UX-1: Loading States

**Check all states:**
- [ ] Idle (shows price)
- [ ] Paying (shows spinner)
- [ ] Unlocking (shows "Verifying...")
- [ ] Unlocked (shows check mark)
- [ ] Error (shows error message)

---

### UX-2: Mobile Responsive

**Devices:**
- [ ] iPhone 13 Pro
- [ ] iPad
- [ ] Android phone

**Expected:**
- Layout adjusts ✅
- Buttons accessible ✅
- Report readable ✅

---

### UX-3: Dark Mode

**Check:**
- [ ] Colors visible
- [ ] Contrast acceptable
- [ ] Gradients work

---

## Bug Tracking

### Found Bugs
| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| X402-1 | 🟡 Medium | No on-chain tx verification | Known |
| X402-2 | 🟢 Low | No rate limiting | Backlog |
| X402-3 | TBD | TBD | - |

---

## Test Results Summary

**Date:** [Fill after testing]  
**Tester:** Patrick Collins 🛡️  
**Environment:** Base Sepolia  

**Pass Rate:** ___ / 21 tests

**Critical Issues:** ___  
**Medium Issues:** ___  
**Low Issues:** ___  

**Ready for Demo:** [ ] YES [ ] NO  
**Ready for Production:** [ ] YES [ ] NO  

---

## Manual Test Commands

### Check USDC Balance
```bash
# Using cast (Foundry)
cast call 0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  "balanceOf(address)(uint256)" \
  YOUR_ADDRESS \
  --rpc-url https://sepolia.base.org
```

### Check USDC Allowance
```bash
cast call 0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  "allowance(address,address)(uint256)" \
  YOUR_ADDRESS \
  0x872989F7fCd4048acA370161989d3904E37A3cB3 \
  --rpc-url https://sepolia.base.org
```

### Verify Transaction
```bash
cast tx 0xTXHASH --rpc-url https://sepolia.base.org
```

---

## Checklist Before Going Live

**Smart Contracts:**
- [ ] Treasury address verified
- [ ] Can receive USDC
- [ ] Can withdraw USDC (owner only)

**API:**
- [ ] Gemini API key set
- [ ] Environment variables configured
- [ ] Database migrations run

**Frontend:**
- [ ] Build succeeds
- [ ] No console errors
- [ ] BaseScan links work

**Security:**
- [ ] Fix transaction verification
- [ ] Add rate limiting
- [ ] Add monitoring

---

**End of Test Script**
