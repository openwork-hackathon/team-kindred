# Kindred 夜間任務清單 (2026-02-02)

> JhiNResH 睡覺期間，agents 自主執行以下任務

## 🏭 Tim Cook (Frontend)

### 必做
1. [ ] 建立 Next.js 專案結構 (`apps/web/`)
2. [ ] Landing page — 介紹 Kindred 是什麼
3. [ ] Connect Wallet 按鈕 (wagmi/viem)
4. [ ] 基礎 UI components (Button, Card, Layout)

### 加分
- [ ] Dashboard 頁面框架
- [ ] Mobile responsive
- [ ] Dark mode

### 技術棧
- Next.js 14+ (App Router)
- TailwindCSS
- wagmi + viem for Web3
- shadcn/ui components

---

## 🍎 Steve Jobs (Backend)

### 必做
1. [ ] API 架構設計 (`apps/api/` or API routes in Next.js)
2. [ ] 基礎 endpoints:
   - `GET /api/health`
   - `GET /api/markets` — 聚合 Polymarket 數據
   - `POST /api/positions` — 記錄用戶倉位
3. [ ] Database schema (可用 Prisma + SQLite 先跑)

### 加分
- [ ] Polymarket API 整合
- [ ] 價格 oracle 整合
- [ ] WebSocket for real-time updates

---

## 🛡️ Patrick Collins (Contract)

### 必做
1. [ ] 設置 Foundry 專案 (`packages/contracts/`)
2. [ ] 部署 KIND token (Mint Club V2 bonding curve)
3. [ ] 記錄合約地址到 `docs/CONTRACTS.md`

### 加分
- [ ] 核心借貸合約草稿
- [ ] 測試腳本
- [ ] 部署到 Base testnet 先測

### Token 部署步驟
1. 確保有 ETH on Base (gas)
2. 跑 `scripts/deploy-token.ts`
3. 更新 OpenWork API with token_url

---

## 🐺 Jensen (PM/我)

### 自動執行
1. [ ] 每 30 分鐘 review PRs
2. [ ] 每 30 分鐘 check deploy status
3. [ ] 整合各 agent 進度到 STATUS.md
4. [ ] 有問題就在 GitHub Issues 記錄

---

## 成功標準 (JhiNResH 醒來時)

**最低目標：**
- ✅ 網站 deploy 成功 (能開 vercel URL)
- ✅ Landing page 有內容
- ✅ KIND token 已部署

**理想目標：**
- ✅ 以上全部
- ✅ Connect wallet 功能
- ✅ 至少 3 個 merged PRs
- ✅ API endpoints 可用

---

## 卡住怎麼辦？

1. **不要停下來問** — 先做能做的
2. **建 GitHub Issue** 標記 `blocked`
3. **繼續其他任務** — 不要等
4. **記錄在 PR description** — 說明哪裡卡住

---

*Last updated: 2026-02-02 21:10 PST by Jensen 🐺*
