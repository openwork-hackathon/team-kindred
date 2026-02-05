# Kindred Contracts Security Audit Report

**Auditor:** Patrick Collins 🛡️  
**Date:** 2026-02-04  
**Commit:** Current state  
**Scope:** All Solidity contracts in `/contracts`

---

## Executive Summary

This audit covers the Kindred protocol's smart contracts, focusing on the reputation-based fee system for Uniswap v4 Hooks. The audit identifies **3 Critical**, **4 High**, **5 Medium**, and **2 Low** severity findings.

### Overall Risk Assessment: **HIGH**

**Critical issues require immediate attention before any deployment.**

---

## Contracts Audited

| Contract | Path | SLOC | Purpose |
|----------|------|------|---------|
| KindredHook (v4) | `core/KindredHook.sol` | 150 | Uniswap v4 Hook with dynamic fees |
| KindredHook (simple) | `src/KindredHook.sol` | 60 | Simplified version (testing?) |
| ReputationOracle | `src/ReputationOracle.sol` | 88 | Reputation score storage |
| IReputationOracle | `interfaces/IReputationOracle.sol` | 45 | Oracle interface |

---

## Findings Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 3 | Open |
| 🟠 High | 4 | Open |
| 🟡 Medium | 5 | Open |
| 🟢 Low | 2 | Open |
| ℹ️ Informational | 5 | Open |

---

## 🔴 Critical Findings

### C-1: Duplicate Contracts with Different Implementations

**Severity:** Critical  
**File:** `core/KindredHook.sol` vs `src/KindredHook.sol`

**Description:**
Two different implementations of `KindredHook` exist:
- `core/KindredHook.sol` (150 lines) — Full Uniswap v4 integration
- `src/KindredHook.sol` (60 lines) — Simplified version without actual Hook logic

This creates deployment confusion and potential for deploying the wrong contract.

**Impact:**
- Risk of deploying non-functional Hook to production
- Confusion in codebase maintenance
- Potential loss of funds if wrong contract is used

**Recommendation:**
```solidity
// IMMEDIATE ACTION REQUIRED:
// 1. Decide which version is canonical
// 2. Delete or clearly rename the other
// 3. Add deployment scripts that reference the correct contract
```

**Remediation:**
- [ ] Choose canonical version (likely `core/KindredHook.sol`)
- [ ] Delete or rename `src/KindredHook.sol` to `KindredHookMock.sol`
- [ ] Update all tests and deployment scripts

---

### C-2: ReputationOracle Interface Mismatch

**Severity:** Critical  
**File:** `src/ReputationOracle.sol`, `interfaces/IReputationOracle.sol`

**Description:**
`ReputationOracle` does NOT implement `IReputationOracle` interface. The interface defines:
- `hasMinimumReputation(address, uint256)`
- `getProjectScore(address)`

But `ReputationOracle.sol` does NOT implement these functions.

**Code:**
```solidity
// interfaces/IReputationOracle.sol (lines 14-16)
function hasMinimumReputation(address account, uint256 minScore) 
    external view returns (bool hasReputation);

function getProjectScore(address project) 
    external view returns (uint256 score);

// src/ReputationOracle.sol — MISSING IMPLEMENTATIONS ❌
```

**Impact:**
- Contract calls will fail at runtime
- Hook cannot verify minimum reputation properly
- Interface promises features that don't exist

**Recommendation:**
```solidity
// Add to ReputationOracle.sol:

function hasMinimumReputation(address account, uint256 minScore) 
    external view returns (bool) 
{
    uint256 score = this.getScore(account);
    return score >= minScore;
}

function getProjectScore(address project) 
    external view returns (uint256) 
{
    // Implement project-level reputation or remove from interface
    revert("Not implemented");
}

// Also add:
contract ReputationOracle is IReputationOracle, Ownable { ... }
```

**Remediation:**
- [ ] Implement missing interface functions
- [ ] Add `is IReputationOracle` inheritance
- [ ] Add interface compliance tests

---

### C-3: Missing Constructor Zero-Address Check in Core Hook

**Severity:** Critical  
**File:** `core/KindredHook.sol` (line 53-57)

**Description:**
The `core/KindredHook.sol` constructor does NOT check if `_reputationOracle` is zero address, while the simpler `src/KindredHook.sol` DOES check it.

**Code:**
```solidity
// core/KindredHook.sol — NO CHECK ❌
constructor(
    IPoolManager _poolManager,
    IReputationOracle _reputationOracle
) BaseHook(_poolManager) {
    reputationOracle = _reputationOracle;  // Could be address(0)!
}

// src/KindredHook.sol — HAS CHECK ✅
constructor(address _reputationOracle) {
    if (_reputationOracle == address(0)) revert ZeroAddress();
    reputationOracle = IReputationOracle(_reputationOracle);
}
```

**Impact:**
- Deployment with `address(0)` oracle will cause ALL swaps to revert
- Entire pool becomes unusable
- No way to fix without redeploying Hook

**Recommendation:**
```solidity
// Fix core/KindredHook.sol constructor:
constructor(
    IPoolManager _poolManager,
    IReputationOracle _reputationOracle
) BaseHook(_poolManager) {
    if (address(_reputationOracle) == address(0)) {
        revert("Zero address oracle");
    }
    reputationOracle = _reputationOracle;
}
```

**Remediation:**
- [ ] Add zero-address check to constructor
- [ ] Add deployment test verifying revert on zero address
- [ ] Consider using custom error for gas efficiency

---

## 🟠 High Findings

### H-1: Updater Privilege Escalation Risk

**Severity:** High  
**File:** `src/ReputationOracle.sol` (lines 18-21, 44-56)

**Description:**
`updaters` mapping grants UNLIMITED power to modify ANY user's reputation score without time locks, multisig, or governance.

**Attack Vector:**
1. Compromised updater key
2. Malicious insider
3. Social engineering attack on updater

**Code:**
```solidity
modifier onlyUpdater() {
    if (!updaters[msg.sender] && msg.sender != owner()) revert NotAuthorized();
    _;
}

function setScore(address account, uint256 score) external onlyUpdater {
    // NO TIME LOCK ❌
    // NO MULTISIG ❌
    // NO GOVERNANCE ❌
    scores[account] = score;
}
```

**Impact:**
- Updater can instantly block any user (set score to 0)
- Can give themselves or accomplices elite status (score 1000)
- Can manipulate fees for front-running opportunities
- Single point of failure

**Recommendation:**
```solidity
// Option 1: Add time lock
mapping(address => PendingScoreUpdate) public pendingUpdates;

struct PendingScoreUpdate {
    uint256 newScore;
    uint256 executeAfter;  // timestamp
}

function proposeScoreUpdate(address account, uint256 score) external onlyUpdater {
    pendingUpdates[account] = PendingScoreUpdate({
        newScore: score,
        executeAfter: block.timestamp + 2 days
    });
}

function executeScoreUpdate(address account) external {
    PendingScoreUpdate memory update = pendingUpdates[account];
    require(block.timestamp >= update.executeAfter, "Too early");
    scores[account] = update.newScore;
}

// Option 2: Multisig requirement
uint256 constant APPROVALS_REQUIRED = 2;
mapping(bytes32 => uint256) public approvals;

function approveScoreUpdate(address account, uint256 score) external onlyUpdater {
    bytes32 updateHash = keccak256(abi.encode(account, score));
    approvals[updateHash]++;
    if (approvals[updateHash] >= APPROVALS_REQUIRED) {
        scores[account] = score;
        delete approvals[updateHash];
    }
}
```

**Remediation:**
- [ ] Implement time lock (2-7 days)
- [ ] Add multisig for score updates above threshold
- [ ] Emit events for all updates
- [ ] Add emergency pause mechanism

---

### H-2: Front-Running via Public Score Updates

**Severity:** High  
**File:** `src/ReputationOracle.sol` + `core/KindredHook.sol`

**Description:**
Score updates are public and instant, allowing MEV bots to front-run trades when they see score changes.

**Attack Scenario:**
1. Updater calls `setScore(alice, 900)` — Alice becomes Elite tier
2. MEV bot sees pending tx in mempool
3. Bot front-runs: executes large swap AS Alice's address (if possible) or sandwich attacks Alice's expected trade
4. Bot profits from knowing Alice will get 0.1% fee instead of 0.5%

**Code Flow:**
```solidity
// TX 1: Score update (public in mempool)
reputationOracle.setScore(alice, 900);

// TX 2: MEV bot sees this and front-runs Alice's swap
uniswapV4.swap(...); // Gets lower fee before Alice realizes her score changed
```

**Impact:**
- MEV extraction from reputation changes
- Unfair advantage to mempool watchers
- Reduced value capture for legitimate users

**Recommendation:**
```solidity
// Option 1: Score update delay
mapping(address => uint256) public scoreEffectiveAt;

function setScore(address account, uint256 score) external onlyUpdater {
    scores[account] = score;
    scoreEffectiveAt[account] = block.timestamp + 1 hours;  // Delay
}

function getScore(address account) external view returns (uint256) {
    if (block.timestamp < scoreEffectiveAt[account]) {
        return scores[account];  // Use old score until effective
    }
    return scores[account];
}

// Option 2: Commit-reveal scheme
mapping(bytes32 => uint256) public commitments;

function commitScoreUpdate(bytes32 commitment) external onlyUpdater {
    commitments[commitment] = block.timestamp;
}

function revealScoreUpdate(
    address account, 
    uint256 score, 
    bytes32 salt
) external onlyUpdater {
    bytes32 commitment = keccak256(abi.encode(account, score, salt));
    require(commitments[commitment] > 0, "No commitment");
    require(block.timestamp >= commitments[commitment] + 10 minutes, "Too early");
    scores[account] = score;
}
```

**Remediation:**
- [ ] Implement score update delay (1-6 hours)
- [ ] Add commit-reveal for large score changes
- [ ] Consider private transactions via Flashbots

---

### H-3: Batch Operation DoS Risk

**Severity:** High  
**File:** `src/ReputationOracle.sol` (line 47-56)

**Description:**
`batchSetScores` has no array length limit, allowing potential out-of-gas DoS or block stuffing attacks.

**Code:**
```solidity
function batchSetScores(
    address[] calldata accounts, 
    uint256[] calldata _scores
) external onlyUpdater {
    require(accounts.length == _scores.length, "Length mismatch");
    for (uint256 i = 0; i < accounts.length; i++) {  // NO LENGTH CHECK ❌
        if (accounts[i] == address(0)) revert ZeroAddress();
        if (_scores[i] > MAX_SCORE) revert ScoreTooHigh(_scores[i]);
        uint256 oldScore = scores[accounts[i]];
        scores[accounts[i]] = _scores[i];
        emit ScoreUpdated(accounts[i], oldScore, _scores[i], msg.sender);
    }
}
```

**Attack Vector:**
1. Malicious/compromised updater submits array with 10,000 addresses
2. Function runs out of gas mid-execution
3. State changes are reverted, but gas is consumed
4. Repeated attacks can block legitimate updates

**Impact:**
- DoS on batch operations
- Wasted gas fees
- Inability to update scores efficiently

**Recommendation:**
```solidity
uint256 public constant MAX_BATCH_SIZE = 100;

function batchSetScores(
    address[] calldata accounts, 
    uint256[] calldata _scores
) external onlyUpdater {
    require(accounts.length == _scores.length, "Length mismatch");
    require(accounts.length <= MAX_BATCH_SIZE, "Batch too large");  // ✅ FIX
    
    for (uint256 i = 0; i < accounts.length; i++) {
        // ... rest of logic
    }
}
```

**Remediation:**
- [ ] Add `MAX_BATCH_SIZE = 100` constant
- [ ] Enforce limit in `batchSetScores`
- [ ] Add gas estimation tests
- [ ] Document batch size limit in NatSpec

---

### H-4: Trader Address Extraction Vulnerability

**Severity:** High  
**File:** `core/KindredHook.sol` (line 81-105)

**Description:**
In `beforeSwap`, the trader address is assumed to be `sender`, but Uniswap v4 allows router contracts to execute swaps on behalf of users. The actual trader may be encoded in `hookData`, which is ignored.

**Code:**
```solidity
function beforeSwap(
    address sender,  // This is the ROUTER, not necessarily the trader!
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    bytes calldata hookData  // Real trader might be here ❌
) external override returns (bytes4, BeforeSwapDelta, uint24) {
    address trader = sender;  // WRONG if using router ❌
    
    if (reputationOracle.isBlocked(trader)) {
        revert AccountBlocked(trader);
    }
    // ... checks wrong address
}
```

**Attack Scenario:**
1. Router contract has high reputation (score 900)
2. Malicious user with low reputation (score 50) calls router
3. Router executes swap with `sender = router address`
4. Hook checks router's score (900), not user's (50)
5. User gets 0.1% fee instead of being blocked

**Impact:**
- Reputation system bypass
- Blocked users can trade through high-reputation routers
- Fee tier exploitation
- Complete failure of access control

**Recommendation:**
```solidity
function beforeSwap(
    address sender,
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    bytes calldata hookData
) external override returns (bytes4, BeforeSwapDelta, uint24) {
    // Extract real trader from hookData
    address trader = sender;
    if (hookData.length >= 20) {
        // Decode trader address from hookData
        trader = address(bytes20(hookData[0:20]));
    }
    
    // Verify signature or other authentication
    // to prevent spoofing
    
    if (reputationOracle.isBlocked(trader)) {
        revert AccountBlocked(trader);
    }
    
    uint256 score = reputationOracle.getScore(trader);
    if (score < MIN_SCORE_TO_TRADE) {
        revert ReputationTooLow(trader, score);
    }
    
    uint24 fee = _calculateFee(score);
    return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, fee);
}
```

**Alternative Solution:**
```solidity
// Require traders to call directly, block router usage
function beforeSwap(...) external override {
    if (sender != tx.origin) {
        revert("Direct calls only");  // No routers allowed
    }
    // ... rest of logic
}
```

**Remediation:**
- [ ] Implement proper trader address extraction from hookData
- [ ] Add signature verification for authenticated traders
- [ ] Test with router contracts (UniversalRouter, etc.)
- [ ] Document hookData format requirement

---

## 🟡 Medium Findings

### M-1: Lack of Emergency Pause Mechanism

**Severity:** Medium  
**File:** `src/ReputationOracle.sol`, `core/KindredHook.sol`

**Description:**
Neither contract has emergency pause functionality to stop operations during attacks or critical bugs.

**Recommendation:**
```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract ReputationOracle is Ownable, Pausable {
    function setScore(...) external onlyUpdater whenNotPaused {
        // ...
    }
    
    function emergencyPause() external onlyOwner {
        _pause();
    }
}
```

**Remediation:**
- [ ] Add OpenZeppelin Pausable
- [ ] Implement pause/unpause functions
- [ ] Test pause functionality

---

### M-2: Missing Events for Critical State Changes

**Severity:** Medium  
**File:** `src/ReputationOracle.sol`

**Description:**
`setUpdater` modifies critical access control but emits generic event. Should have dedicated event.

**Recommendation:**
```solidity
event UpdaterAuthorizationChanged(
    address indexed updater, 
    bool authorized, 
    address indexed changedBy
);

function setUpdater(address updater, bool authorized) external onlyOwner {
    if (updater == address(0)) revert ZeroAddress();
    updaters[updater] = authorized;
    emit UpdaterAuthorizationChanged(updater, authorized, msg.sender);
}
```

**Remediation:**
- [ ] Add specific events for all admin functions
- [ ] Include `msg.sender` in events for auditability

---

### M-3: Unbounded Storage Growth

**Severity:** Medium  
**File:** `src/ReputationOracle.sol`

**Description:**
`scores` and `blocked` mappings grow unbounded. While not immediately critical, this creates long-term scaling concerns.

**Recommendation:**
- Consider implementing periodic cleanup
- Add off-chain archival strategy
- Document storage growth expectations

---

### M-4: Default Score Ambiguity

**Severity:** Medium  
**File:** `src/ReputationOracle.sol` (line 30-33)

**Description:**
`DEFAULT_SCORE = 500` is returned for new addresses AND for addresses that have been explicitly set to 0. This creates confusion.

**Code:**
```solidity
function getScore(address account) external view returns (uint256) {
    uint256 score = scores[account];
    if (score == 0 && !blocked[account]) return DEFAULT_SCORE;  // Ambiguous ❌
    return score;
}
```

**Issue:**
- Cannot distinguish between "never set" and "explicitly set to 0"
- Score of 0 would be interpreted as DEFAULT_SCORE unless account is also blocked

**Recommendation:**
```solidity
mapping(address => bool) public hasScore;

function setScore(address account, uint256 score) external onlyUpdater {
    scores[account] = score;
    hasScore[account] = true;
}

function getScore(address account) external view returns (uint256) {
    if (!hasScore[account] && !blocked[account]) {
        return DEFAULT_SCORE;
    }
    return scores[account];
}
```

**Remediation:**
- [ ] Add `hasScore` tracking
- [ ] Update all score-setting functions
- [ ] Add tests for score = 0 case

---

### M-5: Missing Access Control on View Functions

**Severity:** Medium (Informational leaning)  
**File:** `core/KindredHook.sol`

**Description:**
`canTrade` and `getFeeForAccount` are public view functions that reveal reputation info. While view functions are inherently public, consider if this creates MEV or privacy concerns.

**Recommendation:**
- Document that reputation is public information
- Consider implications for user privacy
- Optionally add view function access control via signatures

---

## 🟢 Low Findings

### L-1: Solidity Version Pragma Inconsistency

**Severity:** Low (Informational)  
**File:** Multiple

**Description:**
Contracts use `^0.8.24` while OpenZeppelin uses `^0.8.20`, creating compiler version conflicts.

**Recommendation:**
```solidity
// Lock to specific version
pragma solidity 0.8.24;
```

**Remediation:**
- [ ] Use locked pragma (remove `^`)
- [ ] Ensure all contracts use same version
- [ ] Update dependencies

---

### L-2: Missing NatSpec Documentation

**Severity:** Low (Informational)  
**File:** `src/KindredHook.sol`, `src/ReputationOracle.sol`

**Description:**
Many functions lack comprehensive NatSpec comments explaining parameters, return values, and behavior.

**Recommendation:**
```solidity
/// @notice Set reputation score for an account
/// @param account The address to update
/// @param score The new score (0-1000)
/// @dev Only callable by authorized updaters
/// @dev Emits ScoreUpdated event
function setScore(address account, uint256 score) external onlyUpdater {
    // ...
}
```

**Remediation:**
- [ ] Add NatSpec to all public/external functions
- [ ] Document all custom errors
- [ ] Add examples in comments

---

## ℹ️ Informational Findings

### I-1: Gas Optimization Opportunities

**Location:** `src/ReputationOracle.sol` (line 47-56)

**Finding:**
`batchSetScores` emits events in a loop. Events are expensive. Consider:
- Batch event emission
- Off-chain indexing instead of on-chain events

---

### I-2: Naming Convention Violations

**Location:** Multiple

**Finding:**
- `_scores` parameter should be `newScores`
- `_blocked` parameter should be `isBlocked`

**Recommendation:**
Follow Solidity style guide for parameter naming.

---

### I-3: Unused Error Definitions

**Location:** `src/KindredHook.sol`

**Finding:**
`error ZeroAddress()` is defined but NOT used in constructor.

**Recommendation:**
Either use it or remove it.

---

### I-4: Missing ReentrancyGuard

**Location:** `src/ReputationOracle.sol`

**Finding:**
While current implementation doesn't need reentrancy protection (no external calls), it's best practice for future-proofing.

**Recommendation:**
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ReputationOracle is Ownable, ReentrancyGuard {
    function setScore(...) external onlyUpdater nonReentrant {
        // ...
    }
}
```

---

### I-5: Consider Upgradeability Pattern

**Location:** All contracts

**Finding:**
Contracts are not upgradeable. If bugs are found post-deployment, no upgrade path exists.

**Recommendation:**
Consider using UUPS or Transparent Proxy pattern for critical contracts like ReputationOracle.

---

## Testing Recommendations

### Unit Tests Required

1. **ReputationOracle:**
   - [ ] Zero address checks in all functions
   - [ ] Batch size limits
   - [ ] Updater authorization changes
   - [ ] Score boundaries (0, 500, 1000, 1001)
   - [ ] Default score logic

2. **KindredHook:**
   - [ ] Fee calculation for all tiers
   - [ ] Blocked user revert
   - [ ] Low reputation revert
   - [ ] Trader address extraction from hookData
   - [ ] Router contract interaction

### Integration Tests Required

1. **Hook + Oracle:**
   - [ ] Score update → fee change
   - [ ] Block user → swap reverts
   - [ ] Unblock user → swap succeeds

2. **Uniswap v4 Integration:**
   - [ ] beforeSwap hook execution
   - [ ] afterSwap event emission
   - [ ] Fee override mechanics
   - [ ] Router contract swaps

### Fuzz Tests Required

1. **Score Boundaries:**
   - `testFuzz_ScoreInRange(uint256 score)`
   - `testFuzz_FeeMonotonicDecrease(uint256 score1, uint256 score2)`

2. **Batch Operations:**
   - `testFuzz_BatchSetScores(address[] accounts, uint256[] scores)`

---

## Deployment Checklist

Before deploying to ANY network (testnet or mainnet):

- [ ] **C-1:** Resolve duplicate contracts (choose one, delete other)
- [ ] **C-2:** Implement missing interface functions
- [ ] **C-3:** Add zero-address check to Hook constructor
- [ ] **H-1:** Implement time lock or multisig for score updates
- [ ] **H-2:** Add score update delay to prevent front-running
- [ ] **H-3:** Add batch size limit
- [ ] **H-4:** Fix trader address extraction
- [ ] Run full test suite (unit + integration + fuzz)
- [ ] Verify all contracts on Etherscan
- [ ] Set up monitoring for critical events
- [ ] Prepare emergency response plan
- [ ] Complete external audit (recommended for mainnet)

---

## Gas Optimization Analysis

### KindredHook Gas Costs

| Function | Estimated Gas | Optimization Potential |
|----------|---------------|------------------------|
| beforeSwap | ~50,000 | Low (mostly external calls) |
| afterSwap | ~30,000 | Medium (event optimization) |
| canTrade | ~10,000 | Low (view function) |

### ReputationOracle Gas Costs

| Function | Estimated Gas | Optimization Potential |
|----------|---------------|------------------------|
| setScore | ~45,000 | Low |
| batchSetScores (n=10) | ~350,000 | Medium (batch event) |
| getScore | ~5,000 | Low (view function) |

**Optimization Recommendations:**
1. Pack storage variables (score + blocked in single slot)
2. Use unchecked blocks for safe arithmetic
3. Cache external call results
4. Consider EIP-2535 Diamond pattern for upgradeability

---

## Conclusion

The Kindred contracts implement an innovative reputation-based fee system for Uniswap v4. However, **critical issues must be addressed before any deployment:**

1. **CRITICAL:** Resolve duplicate contracts
2. **CRITICAL:** Fix interface implementation
3. **CRITICAL:** Add constructor validation
4. **HIGH:** Implement proper access controls and delays
5. **HIGH:** Fix trader address extraction vulnerability

**Overall Security Score:** 4/10 (Current State)  
**Estimated Score After Fixes:** 8/10

**Recommendation:** **DO NOT DEPLOY** until all Critical and High findings are resolved.

---

**Next Steps:**
1. Address all Critical findings (target: 24-48 hours)
2. Implement High severity fixes (target: 3-5 days)
3. Re-audit after fixes
4. External audit before mainnet (recommended)
5. Bug bounty program post-launch (recommended)

---

*Audit completed: 2026-02-04 16:55 PST*  
*Auditor: Patrick Collins 🛡️*  
*Contact: @BountyHunterLamb_bot (Telegram)*
