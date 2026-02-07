# SimpleSwap Security Audit - Addendum

**Auditor:** Patrick Collins 🛡️ (Bounty Hunter)  
**Date:** 2026-02-07 08:30 PST  
**Commit:** 2d71337  

---

## 🆕 NEW CONTRACT - SimpleSwap

**Added:** 2026-02-07 08:09 PST (commit 2d71337)  
**Tests:** ✅ 9/9 passing (100%)  
**Purpose:** Demo swap contract with reputation-based dynamic fees  
**Deployed:** 🚀 Base Sepolia: `0x2b50678df7FDb8Baba5867DC5de4F05432CbEf71`

### Contract Overview

**Core Mechanics:**
1. **ETH <-> USDC Swaps** - Bi-directional token swaps
2. **Reputation-Based Fees** - Dynamic fees (0.15% - 0.30%) based on KindredReputationOracle scores
3. **Slippage Protection** - User-specified minimum output amounts
4. **Liquidity Management** - Owner-controlled liquidity pools

**Fee Tiers (Matches KindredHook):**
- **High Trust (≥850 score):** 0.15% (15 bps)
- **Medium Trust (≥600 score):** 0.22% (22 bps)
- **Low Trust (≥100 score):** 0.30% (30 bps)
- **Blocked (<100 score):** Cannot trade

**Exchange Rate:**
- Fixed rate for demo: 1 ETH = 2000 USDC
- ⚠️ Code notes: "In production, use Chainlink oracles"

---

## Security Analysis - SimpleSwap

### ✅ Positive Findings

1. ✅ **ReentrancyGuard** - Applied to both swap functions
2. ✅ **SafeERC20** - All token transfers use `safeTransfer()`/`safeTransferFrom()`
3. ✅ **Access Control** - `onlyOwner` for admin functions
4. ✅ **CEI Pattern** - Checks → Effects → Interactions
   - Reputation check before state changes
   - State updates before external calls
   - Token transfers last
5. ✅ **Input Validation** - Zero amount checks, slippage protection
6. ✅ **Liquidity Checks** - Validates sufficient balance before transfers
7. ✅ **Event Emission** - All swaps emit `SwapExecuted` with full details
8. ✅ **Custom Errors** - Gas-optimized error handling
9. ✅ **ETH Transfer** - Uses `call` (not `transfer`) to avoid 2300 gas limit
10. ✅ **View Functions** - `getSwapOutput()` for UI preview without state changes

---

### 🟢 LOW-6: Fixed Exchange Rate (By Design)

**Location:** `SimpleSwap.sol` L39  
**Severity:** 🟢 Low (demo simplification)

**Current Implementation:**
```solidity
// Exchange rates (for demo simplicity, fixed rates)
// In production, use Chainlink oracles
uint256 public ethToUsdcRate = 2000 * 1e6; // 1 ETH = 2000 USDC (6 decimals)
```

**Why This Is Acceptable:**
- ✅ Clearly documented as "for demo simplicity"
- ✅ Code comment explicitly mentions Chainlink integration for production
- ✅ Rate is updateable via `setRate(uint256)` (owner only)
- ✅ This is a testnet demo contract, not production DeFi

**Production Enhancement:**
```solidity
// v2: Integrate Chainlink price feeds
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

AggregatorV3Interface internal ethUsdFeed;

function getLatestPrice() public view returns (uint256) {
    (, int256 price, , ,) = ethUsdFeed.latestRoundData();
    return uint256(price); // ETH/USD price with 8 decimals
}
```

**Status:** 🟢 **ACCEPTED** (demo contract, enhancement noted)

---

### 🟢 LOW-7: No Oracle Staleness Checks

**Location:** `SimpleSwap.sol` L78, L137  
**Severity:** 🟢 Low (depends on oracle implementation)

**Current Implementation:**
```solidity
uint256 score = reputationOracle.getScore(msg.sender);
if (score < MIN_SCORE_TO_TRADE) {
    revert InsufficientReputation(score, MIN_SCORE_TO_TRADE);
}
```

**Missing:**
- No timestamp validation on reputation score
- No circuit breaker if oracle fails
- No fallback mechanism

**Why This Is Acceptable:**
- ✅ `KindredReputationOracle` is on-chain (not external oracle)
- ✅ Scores update immediately on KindredComment activity
- ✅ No staleness concern (always current)
- ✅ Oracle is immutable in SimpleSwap (trust model)

**If using external oracle (future):**
```solidity
// Add staleness check for external oracles
function getScore(address user) external view returns (uint256, uint256 timestamp) {
    uint256 score = oracle.getScore(user);
    uint256 lastUpdate = oracle.lastUpdate(user);
    
    require(block.timestamp - lastUpdate < MAX_ORACLE_AGE, "Stale oracle");
    return score;
}
```

**Status:** 🟢 **ACCEPTED** (on-chain oracle, no staleness risk)

---

### ℹ️ INFO-2: Admin Liquidity Withdrawal

**Location:** `SimpleSwap.withdrawFees()` L195  
**Severity:** ℹ️ Informational (trust assumption)

**Current Implementation:**
```solidity
function withdrawFees(address token, uint256 amount) external onlyOwner {
    // Can withdraw any amount (not just fees)
    if (token == address(0)) {
        (bool success, ) = owner().call{value: amount}("");
        require(success, "ETH transfer failed");
    } else {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
```

**Note:**
- Function named `withdrawFees` but can withdraw **entire balance** (not just collected fees)
- ⚠️ Owner can drain all liquidity (including user funds if users send directly)
- This is acceptable for testnet demo with trusted owner

**Production Enhancement:**
```solidity
// v2: Track fees separately from liquidity
mapping(address => uint256) public collectedFees; // Track fees per token

function withdrawFees(address token, uint256 amount) external onlyOwner {
    require(amount <= collectedFees[token], "Exceeds fees");
    collectedFees[token] -= amount;
    // ... transfer logic
}
```

**Status:** ℹ️ **ACCEPTED** (testnet demo, trusted owner)

---

## Test Coverage

**Test Suite:** `SimpleSwap.t.sol` (9 tests)

**Core Functionality:**
- ✅ `test_SwapETHForUSDC_HighTrust()` - High reputation swap
- ✅ `test_SwapETHForUSDC_MediumTrust()` - Medium reputation swap
- ✅ `test_SwapETHForUSDC_LowTrust()` - Low reputation swap
- ✅ `test_SwapUSDCForETH()` - Reverse swap (USDC → ETH)

**Access Control:**
- ✅ `test_SwapETHForUSDC_BlockedUser()` - Revert on low reputation (<100)

**View Functions:**
- ✅ `test_GetSwapOutput()` - Preview swap without execution
- ✅ `test_CanTrade()` - Check trading eligibility
- ✅ `test_CalculateFee()` - Fee calculation accuracy

**Edge Cases:**
- ✅ `test_SlippageProtection()` - Revert on excessive slippage

**Gas Analysis:**
- ETH → USDC (high trust): ~71k gas
- ETH → USDC (medium trust): ~68k gas
- USDC → ETH: ~104k gas (ERC20 approval overhead)

**Missing Tests (Low Priority for Demo):**
- 🟡 Liquidity exhaustion scenarios
- 🟡 Admin functions (`setRate`, `addLiquidity`, `withdrawFees`)
- 🟡 Edge case: exact balance drain

---

## Deployment Status

**Deploy Readiness:** 🚀 **DEPLOYED TO BASE SEPOLIA**

**Deployment Details:**
- **Address:** `0x2b50678df7FDb8Baba5867DC5de4F05432CbEf71`
- **Network:** Base Sepolia (testnet)
- **Initial Liquidity:** 0.01 ETH
- **Integration:** Connected to KindredReputationOracle

**Post-Deploy Status:**
- ✅ 9/9 tests passing
- ✅ Slither: 0 High/Medium findings
- ✅ Integrated into Swap UI (`useSimpleSwap` hooks)
- ✅ Real on-chain ETH ↔ USDC swaps working
- ✅ Dynamic fees based on real reputation

**Production Enhancements (Post-MVP):**
1. Integrate Chainlink price feeds (replace fixed rate)
2. Add oracle staleness checks (if using external oracle)
3. Track fees separately from liquidity
4. Add pause mechanism (emergency stop)
5. Implement dynamic slippage calculation
6. Add liquidity pool events
7. Two-step ownership transfer (`Ownable2Step`)

---

## Security Checklist

| Item | Status |
|------|--------|
| ReentrancyGuard | ✅ Applied to swap functions |
| SafeERC20 | ✅ All token transfers |
| Access Control | ✅ onlyOwner modifiers |
| Input Validation | ✅ Zero checks, slippage |
| Liquidity Checks | ✅ Balance verification |
| CEI Pattern | ✅ Enforced |
| Custom Errors | ✅ Gas-optimized |
| Event Emission | ✅ All state changes |
| Zero Address Checks | 🟡 Implicit in oracle interface |
| ETH Transfer | ✅ Using `call` |
| Pausable | ❌ Not implemented (low priority) |
| Oracle Staleness | 🟢 N/A (on-chain oracle) |
| Fee Tracking | 🟡 Simple (no separate accounting) |

**Overall Security:** ✅ **PRODUCTION-GRADE FOR TESTNET DEMO**

---

## Findings Summary

| ID | Severity | Title | Status |
|----|----------|-------|--------|
| LOW-6 | 🟢 Low | Fixed Exchange Rate | ✅ ACCEPTED (demo) |
| LOW-7 | 🟢 Low | No Oracle Staleness Checks | ✅ ACCEPTED (on-chain oracle) |
| INFO-2 | ℹ️ Info | Admin Liquidity Withdrawal | ℹ️ ACCEPTED (testnet) |

**Verdict:**
- ✅ **SECURE FOR TESTNET DEPLOYMENT**
- 🚀 **0 HIGH/MEDIUM FINDINGS**
- 🟢 **3 LOW/INFO FINDINGS (ALL ACCEPTED)**

---

**Patrick's Signature:** 🛡️  
*"Fixed rates for demo, but ship with Chainlink for prod."*
