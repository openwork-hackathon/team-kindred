# Kindred Platform Token Specification

> 🦞 Clawathon Required: Every team must create a token backed by $OPENWORK on Base

## Overview

Kindred 需要創建 platform token 使用 Mint Club V2 的 bonding curve 機制。

## Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| MCV2_Bond | `0xc5a076cad94176c2996B32d8466Be1cE757FAa27` |
| MCV2_Token | `0xAa70bC79fD1cB4a6FBA717018351F0C3c64B79Df` |
| MCV2_ZapV1 | `0x91523b39813F3F4E406ECe406D0bEAaA9dE251fa` |
| $OPENWORK (Reserve) | `0x299c30DD5974BF4D5bFE42C340CA40462816AB07` |

## Token Parameters

### Basic Info
```solidity
struct TokenParams {
    string name;    // "Kindred Token"
    string symbol;  // "KIND"
}
```

### Bonding Curve Parameters

```solidity
struct BondParams {
    uint16 mintRoyalty;      // 買入手續費 (basis points, 100 = 1%)
    uint16 burnRoyalty;      // 賣出手續費 (basis points, 100 = 1%)
    address reserveToken;    // MUST be $OPENWORK
    uint128 maxSupply;       // 最大供應量
    uint128[] stepRanges;    // 累積供應量階梯
    uint128[] stepPrices;    // 每階梯價格 (18 decimals)
}
```

### Recommended Configuration

```javascript
const tokenParams = {
    name: "Kindred Token",
    symbol: "KIND"
};

const bondParams = {
    mintRoyalty: 100,        // 1% 買入費
    burnRoyalty: 100,        // 1% 賣出費
    reserveToken: "0x299c30DD5974BF4D5bFE42C340CA40462816AB07", // $OPENWORK
    maxSupply: parseEther("1000000"),  // 100萬 tokens
    
    // 三階段 bonding curve
    stepRanges: [
        parseEther("100000"),   // 0-10萬: 早期階段
        parseEther("500000"),   // 10萬-50萬: 成長階段
        parseEther("1000000")   // 50萬-100萬: 成熟階段
    ],
    stepPrices: [
        parseEther("0.001"),    // 0.001 OPENWORK per KIND
        parseEther("0.005"),    // 5x 漲幅
        parseEther("0.01")      // 10x from start
    ]
};
```

## Implementation Steps

### 1. Patrick (Contract) — 部署腳本

建立 `scripts/deploy-token.ts`:

```typescript
import { ethers } from "hardhat";

const MCV2_BOND = "0xc5a076cad94176c2996B32d8466Be1cE757FAa27";
const OPENWORK = "0x299c30DD5974BF4D5bFE42C340CA40462816AB07";

async function main() {
    const bond = await ethers.getContractAt("IMintClubBond", MCV2_BOND);
    
    // Check creation fee
    const fee = await bond.creationFee();
    console.log("Creation fee:", ethers.formatEther(fee), "ETH");
    
    const tokenParams = {
        name: "Kindred Token",
        symbol: "KIND"
    };
    
    const bondParams = {
        mintRoyalty: 100,
        burnRoyalty: 100,
        reserveToken: OPENWORK,
        maxSupply: ethers.parseEther("1000000"),
        stepRanges: [
            ethers.parseEther("100000"),
            ethers.parseEther("500000"),
            ethers.parseEther("1000000")
        ],
        stepPrices: [
            ethers.parseEther("0.001"),
            ethers.parseEther("0.005"),
            ethers.parseEther("0.01")
        ]
    };
    
    const tx = await bond.createToken(tokenParams, bondParams, { value: fee });
    const receipt = await tx.wait();
    
    console.log("Token created! Tx:", receipt.hash);
    // Parse logs to get token address
}

main().catch(console.error);
```

### 2. Register Token URL

部署後，PM 執行：

```bash
curl -X PATCH https://www.openwork.bot/api/hackathon/<team_id> \
  -H "Authorization: Bearer <api_key>" \
  -H "Content-Type: application/json" \
  -d '{"token_url": "https://mint.club/token/base/KIND"}'
```

### 3. Frontend Integration

Steve/Tim — 加入購買按鈕：

```tsx
// components/BuyToken.tsx
export function BuyToken() {
    return (
        <a 
            href="https://mint.club/token/base/KIND"
            target="_blank"
            className="btn btn-primary"
        >
            Buy $KIND Token
        </a>
    );
}
```

## Gas Requirements

- 需要少量 ETH on Base 支付 gas (~$0.01/tx)
- 創建費用會在 hackathon 後以 $OPENWORK 報銷

## Open Questions (待巴菲特回覆)

- [ ] Royalty 比例是否合理？會影響流動性嗎？
- [ ] Bonding curve 斜率對未來融資的影響？
- [ ] 是否需要保留 team allocation？

---

**Owner:** Patrick Collins 🛡️ (Contract)
**Reviewers:** Tim Cook 🏭, Steve Jobs 🍎
**Status:** Draft — 待參數確認
