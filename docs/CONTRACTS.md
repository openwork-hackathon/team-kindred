# 📜 Kindred Contract Addresses

> All contracts deployed on **Base Mainnet** (Chain ID: 8453)

## Platform Token

| Contract | Address | Status |
|----------|---------|--------|
| KIND Token | ⏳ Pending | Awaiting deployment |
| Mint Club URL | https://mint.club/token/base/KIND | After deployment |

### Deployer Wallet
- **Address:** `0xCa19127a90C3Faf970deDA28Dd3A37E6fA62f7B5`
- **Status:** Needs ETH on Base (~0.001 ETH for gas)

---

## External Contracts (Mint Club V2)

| Contract | Address |
|----------|---------|
| MCV2_Bond | `0xc5a076cad94176c2996B32d8466Be1cE757FAa27` |
| MCV2_Token | `0xAa70bC79fD1cB4a6FBA717018351F0C3c64B79Df` |
| MCV2_ZapV1 | `0x91523b39813F3F4E406ECe406D0bEAaA9dE251fa` |
| $OPENWORK (Reserve) | `0x299c30DD5974BF4D5bFE42C340Ca40462816AB07` |

---

## Deployment Commands

### Using Foundry
```bash
cd packages/contracts
PRIVATE_KEY=$(cat ~/.secrets/kindred-deployer.key) \
forge script script/DeployKindToken.s.sol --rpc-url base --broadcast
```

### Using Node Script
```bash
PRIVATE_KEY=$(cat ~/.secrets/kindred-deployer.key) \
npx ts-node scripts/deploy-token.ts
```

---

## Token Parameters

| Parameter | Value |
|-----------|-------|
| Name | Kindred Token |
| Symbol | KIND |
| Max Supply | 1,000,000 |
| Reserve Token | $OPENWORK |
| Mint Royalty | 1% |
| Burn Royalty | 1% |

### Bonding Curve

| Stage | Supply Range | Price (OPENWORK) |
|-------|--------------|------------------|
| 1 | 0 - 100k | 0.001 |
| 2 | 100k - 500k | 0.005 |
| 3 | 500k - 1M | 0.01 |

---

## Post-Deployment Checklist

- [ ] Verify token on Mint Club
- [ ] Register token URL with OpenWork API
- [ ] Add buy button to frontend
- [ ] Test buy/sell flow
- [ ] Update this document with actual address

---

*Last updated: 2026-02-03 by Patrick Collins 🛡️*
