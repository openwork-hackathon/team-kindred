# KindredHook Fee Logic Review & Recommendations

**Reviewer:** Patrick Collins 🛡️  
**Date:** 2026-02-04  
**Task:** Verify fee calculation logic & propose improvements

---

## Current State Analysis

### 1. Existing Fee Tiers (contracts/core/KindredHook.sol)

```solidity
// Constants
uint256 public constant MIN_SCORE_TO_TRADE = 100;
uint256 public constant ELITE_THRESHOLD = 900;
uint256 public constant TRUSTED_THRESHOLD = 700;
uint256 public constant NORMAL_THRESHOLD = 400;

uint24 public constant FEE_ELITE = 10;      // 0.1% (10 bps)
uint24 public constant FEE_TRUSTED = 20;    // 0.2% (20 bps)
uint24 public constant FEE_NORMAL = 30;     // 0.3% (30 bps)
uint24 public constant FEE_RISKY = 50;      // 0.5% (50 bps)

// Logic
function _calculateFee(uint256 score) internal pure returns (uint24) {
    if (score >= 900) return 10;        // ELITE
    else if (score >= 700) return 20;   // TRUSTED
    else if (score >= 400) return 30;   // NORMAL
    else return 50;                     // RISKY (100-399)
    // <100 blocked entirely
}
```

### 2. JhiNResH's Requirement

> "如果 reputation > 100，fee = 0.05% (5 bps)"

**Interpretation:**
- Binary mode: >100 = 5 bps, <=100 = blocked or high fee
- Simpler for MVP demo

### 3. Current Issues

| Issue | Current | Required | Status |
|-------|---------|----------|--------|
| Elite fee | 10 bps (0.1%) | 5 bps (0.05%) | ❌ MISMATCH |
| Binary mode | No | Optional | ⚠️ MISSING |
| feeTier in DB | No field | Mentioned by Jensen | ⚠️ NOT FOUND |

---

## Recommendation: Dual Mode System

### Option A: Keep Complex Tiers, Adjust Elite Fee ✅

**Rationale:** The 4-tier system is good UX, just needs adjustment.

```solidity
// Updated constants
uint24 public constant FEE_ELITE = 5;       // 0.05% (5 bps) ← FIXED
uint24 public constant FEE_TRUSTED = 15;    // 0.15% (15 bps)
uint24 public constant FEE_NORMAL = 25;     // 0.25% (25 bps)
uint24 public constant FEE_RISKY = 50;      // 0.5% (50 bps)

// Logic stays the same
function _calculateFee(uint256 score) internal pure returns (uint24) {
    if (score >= ELITE_THRESHOLD) return FEE_ELITE;      // 5 bps ✅
    else if (score >= TRUSTED_THRESHOLD) return FEE_TRUSTED;
    else if (score >= NORMAL_THRESHOLD) return FEE_NORMAL;
    else return FEE_RISKY;
}
```

**Pros:**
- Maintains granular incentive structure
- Clear progression path for users
- Better for long-term product

**Cons:**
- More complex for MVP demo

---

### Option B: Add Binary Mode Flag 🎯

**Rationale:** Support both complex and simple modes via config.

```solidity
contract KindredHook is BaseHook {
    // ... existing state
    
    bool public useBinaryMode;  // Toggle between modes
    
    constructor(
        IPoolManager _poolManager,
        IReputationOracle _reputationOracle,
        bool _useBinaryMode
    ) BaseHook(_poolManager) {
        if (address(_reputationOracle) == address(0)) {
            revert("Zero address oracle");
        }
        reputationOracle = _reputationOracle;
        useBinaryMode = _useBinaryMode;
    }
    
    function _calculateFee(uint256 score) internal view returns (uint24) {
        if (useBinaryMode) {
            // Simple binary mode for MVP
            return score > MIN_SCORE_TO_TRADE ? 5 : 50;  // 5 bps or 50 bps
        } else {
            // Complex 4-tier mode for production
            if (score >= ELITE_THRESHOLD) return 5;      // 0.05%
            else if (score >= TRUSTED_THRESHOLD) return 15;
            else if (score >= NORMAL_THRESHOLD) return 25;
            else return 50;
        }
    }
    
    // Admin function to toggle mode
    function setBinaryMode(bool _useBinaryMode) external onlyOwner {
        useBinaryMode = _useBinaryMode;
        emit BinaryModeChanged(_useBinaryMode);
    }
}
```

**Pros:**
- Flexibility for demos and production
- Can A/B test which users prefer
- Backward compatible

**Cons:**
- Additional state variable (gas cost)
- More complex codebase

---

### Option C: Just Use Binary Mode 🚀

**Rationale:** KISS for MVP, iterate later.

```solidity
uint24 public constant FEE_LOW = 5;         // 0.05% for score > 100
uint24 public constant FEE_HIGH = 50;       // 0.5% for score <= 100

function _calculateFee(uint256 score) internal pure returns (uint24) {
    return score > MIN_SCORE_TO_TRADE ? FEE_LOW : FEE_HIGH;
}
```

**Pros:**
- Simplest implementation
- Clear messaging: "Good reputation = low fees"
- Fast to ship

**Cons:**
- Less nuanced incentives
- Hard to add tiers later without redeployment

---

## Prisma DB Integration

### Issue: `User.feeTier` Field Missing

Jensen mentioned `Prisma DB User.feeTier`, but it's NOT in current schema.

**Add to schema:**

```prisma
model User {
  // ... existing fields
  
  // Fee tier tracking
  feeTier         String    @default("RISKY") // ELITE, TRUSTED, NORMAL, RISKY
  currentFee      Int       @default(50)      // in basis points
  
  // Relations
  reviews         Review[]
  stakes          Stake[]
  votes           Vote[]
}
```

**Sync logic (backend):**

```typescript
// When reputation score changes
async function updateUserFeeTier(address: string, score: number) {
  let feeTier: string;
  let currentFee: number;
  
  if (score >= 900) {
    feeTier = "ELITE";
    currentFee = 5;
  } else if (score >= 700) {
    feeTier = "TRUSTED";
    currentFee = 15;
  } else if (score >= 400) {
    feeTier = "NORMAL";
    currentFee = 25;
  } else {
    feeTier = "RISKY";
    currentFee = 50;
  }
  
  await prisma.user.update({
    where: { address },
    data: { feeTier, currentFee }
  });
}
```

---

## Testing Requirements

### Test Cases Needed

```solidity
// Test: reputation > 100 gets 5 bps fee
function test_FeeCalculation_Above100() public {
    oracle.setScore(alice, 150);
    uint24 fee = hook.getFeeForAccount(alice);
    assertEq(fee, 5, "Score 150 should get 5 bps fee");
}

// Test: reputation = 100 gets blocked or high fee
function test_FeeCalculation_Exactly100() public {
    oracle.setScore(alice, 100);
    bool canTrade = hook.canTrade(alice);
    assertFalse(canTrade, "Score 100 should not be able to trade");
}

// Test: reputation < 100 blocked
function test_FeeCalculation_Below100() public {
    oracle.setScore(alice, 50);
    vm.expectRevert();
    hook.validateTrade(alice);
}

// Test: all tier boundaries
function test_FeeCalculation_AllTiers() public {
    assertEq(hook.getFeeForAccount(makeAddr("elite")), 5);     // 900+
    assertEq(hook.getFeeForAccount(makeAddr("trusted")), 15);  // 700-899
    assertEq(hook.getFeeForAccount(makeAddr("normal")), 25);   // 400-699
    assertEq(hook.getFeeForAccount(makeAddr("risky")), 50);    // 100-399
}
```

---

## Recommended Action Plan

### Phase 1: Quick Fix (Today)
- [ ] Change `FEE_ELITE` from 10 to 5 bps
- [ ] Add `test_FeeCalculation_Above100()` test
- [ ] Verify `getFeeForAccount()` callable from frontend

### Phase 2: DB Sync (Tomorrow)
- [ ] Add `feeTier` and `currentFee` to Prisma User model
- [ ] Write backend sync logic
- [ ] Test DB updates when reputation changes

### Phase 3: Binary Mode (Optional, for Demo)
- [ ] Implement Option B (dual mode) if needed for demos
- [ ] Add toggle function
- [ ] Update tests

---

## Frontend Integration

### Contract ABI for getFeeForAccount

```typescript
// Frontend can call this directly
const fee = await kindredHook.getFeeForAccount(userAddress);
// Returns: 5, 15, 25, or 50 (basis points)

// Display to user
const feePercent = fee / 100; // 0.05%, 0.15%, 0.25%, 0.5%
```

### Example React Hook

```typescript
function useUserFee(address: string) {
  const { data: fee } = useContractRead({
    address: KINDRED_HOOK_ADDRESS,
    abi: KindredHookABI,
    functionName: 'getFeeForAccount',
    args: [address],
  });
  
  return {
    fee,
    feePercent: fee ? fee / 100 : null,
    tier: fee === 5 ? 'ELITE' : 
          fee === 15 ? 'TRUSTED' :
          fee === 25 ? 'NORMAL' : 'RISKY'
  };
}
```

---

## Conclusion

**My Recommendation: Option A (Keep 4 tiers, fix Elite fee)**

Why:
1. Better UX long-term
2. Clear progression (gamification)
3. Only needs one-line change: `FEE_ELITE = 5`
4. Binary mode can be added later if needed

**Immediate Action:**
```solidity
// Change line 27 in core/KindredHook.sol
- uint24 public constant FEE_ELITE = 10;
+ uint24 public constant FEE_ELITE = 5;
```

This satisfies JhiNResH's requirement while keeping the better design.

---

*Review completed: 2026-02-04 17:05 PST*  
*Next: Implement fix & add tests*
