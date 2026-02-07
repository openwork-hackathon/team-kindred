# Circle USDC Hackathon Submission

**Project:** Kindred
**Track:** Smart Contracts
**Deadline:** February 8, 2026

---

## 🎯 One-Liner

Kindred is a stake-weighted review platform where USDC payments unlock premium insights and signal authentic content.

---

## 📝 Project Description

Kindred transforms online reviews into verifiable, trustworthy signals using USDC-based staking and the x402 payment protocol.

### The Problem
- Fake reviews plague every platform (Yelp, Google, TripAdvisor)
- No way to verify reviewer authenticity
- No incentive for quality over quantity

### Our Solution
1. **Stake to Review** — Reviewers stake USDC to post, creating skin in the game
2. **x402 Premium Insights** — Pay $0.10 USDC to unlock AI-powered deep analysis
3. **Reputation = Lower Fees** — High-trust users get reduced Uniswap v4 swap fees via KindredHook

---

## 🔗 USDC Integration

### 1. x402 Payment Protocol
- Premium restaurant insights require USDC micropayment
- HTTP 402 response with payment requirements
- Instant content unlock after on-chain payment

### 2. Staking Mechanism
- Reviews require USDC stake (min $1)
- Higher stakes = more visibility
- Slashing for proven fake reviews

### 3. KindredHook (Uniswap v4)
- Dynamic fees based on user reputation
- High-trust users: 0.1% fee
- Low-trust users: 0.5% fee
- Fees collected in USDC

---

## 🏗️ Technical Architecture

```
┌─────────────────┐     ┌──────────────────┐
│   Next.js App   │────▶│  x402 API        │
│   (Frontend)    │     │  (Payment Gate)  │
└─────────────────┘     └──────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  Privy Wallet   │────▶│  Base Network    │
│  (Auth + Sign)  │     │  (USDC + Hooks)  │
└─────────────────┘     └──────────────────┘
```

### Smart Contracts (Base Sepolia)
- **KindToken:** ERC-20 governance token
- **KindredComment:** ERC-404 review NFTs
- **KindredHook:** Uniswap v4 dynamic fee hook
- **Treasury:** USDC collection

---

## 🎬 Demo

**Live URL:** [TODO: Add Arc deployment URL]

**Demo Flow:**
1. Connect wallet (Privy)
2. Search for restaurant (e.g., "Pampas Grill")
3. View community reviews
4. Click "Unlock Premium Insight" → Pay $0.10 USDC
5. View AI-generated deep analysis

---

## 👥 Team

- **JhiNResH** — Founder, Full-stack
- **Jensen (AI)** — PM, Coordination
- **Steve (AI)** — Development
- **Patrick (AI)** — Security, Contracts

---

## 📦 Repositories

- **Main Repo:** https://github.com/openwork-hackathon/team-kindred
- **Contracts:** `/contracts/src/`

---

## 🔑 Contract Addresses (Base Sepolia)

| Contract | Address |
|----------|---------|
| KindToken | `[TODO]` |
| KindredComment | `[TODO]` |
| KindredHook | `[TODO]` |
| Treasury | `[TODO]` |

---

## 📹 Video Demo

[TODO: Record 3-min demo video]

**Script:**
1. (0:00-0:30) Problem: Fake reviews everywhere
2. (0:30-1:30) Solution: Stake-weighted reviews + x402
3. (1:30-2:30) Demo: Search → Pay USDC → Unlock insight
4. (2:30-3:00) Future: KindredHook integration

---

## ✅ Submission Checklist

- [ ] Live demo URL
- [ ] Contract addresses filled in
- [ ] Video recorded and uploaded
- [ ] GitHub repo public
- [ ] Submission form completed
