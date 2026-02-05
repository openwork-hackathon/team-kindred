# KindredHook Integration Notes

## ⚠️ Critical: Trader Address Extraction (H-4)

### Problem
The current `KindredHook.validateTrade()` assumes the trader address can be reliably obtained from function parameters. However, when swaps go through a Router contract, the `msg.sender` will be the router address, NOT the end user.

### Impact
- Users can bypass reputation checks by routing through contracts
- The entire trust/reputation system can be circumvented
- **HIGH SEVERITY** security issue

### Solution Options

#### Option A: Use hookData (Recommended)
Frontend/Router should encode the actual trader address in `hookData`:

```solidity
// In Router/Frontend:
bytes memory hookData = abi.encode(actualTraderAddress);

// In KindredHook:
function beforeSwap(
    address sender,
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    bytes calldata hookData
) external override returns (bytes4, BeforeSwapDelta, uint24) {
    address trader = abi.decode(hookData, (address));
    // ... validate trader ...
}
```

#### Option B: Require tx.origin == trader
```solidity
// Prevents contract intermediaries but may break some legitimate integrations
require(tx.origin == trader, "Must be EOA");
```

#### Option C: Whitelist Routers
```solidity
// Only allow specific router contracts
require(trustedRouters[msg.sender] || msg.sender == trader, "Untrusted router");
```

### Current Status
- ✅ Issue documented
- ❌ Fix not yet implemented (requires frontend coordination)
- ⚠️ **DO NOT deploy** until this is resolved

### Action Required
1. Frontend team: Update swap calls to include trader address in hookData
2. Contract team: Implement hookData decoding in KindredHook
3. Test with actual Router integration
4. Deploy only after verification

---
*Added: 2026-02-04*  
*Severity: HIGH*  
*Blocker: Yes*
