# 🛡️ Vercel Environment Variables Setup Guide

## 📋 Required Environment Variables

### 1. Database (必需)
```
DATABASE_URL=postgresql://postgres:IBUILDKINDRED49@db.pmfefhiboklhrhxhgsex.supabase.co:5432/postgres?sslmode=require
```

### 2. Privy Authentication (必需)
```
NEXT_PUBLIC_PRIVY_APP_ID=cmkncaz3r0047ic0dtanwx48p
```

### 3. Google AI (必需)
```
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDgRXA83-aikivATuZbm4CnmyKLrY4G_lo
```

### 4. Privy Server Wallet (可選，暫時不需要)
```
PRIVY_APP_SECRET=privy_app_secret_PWhPmgJw6kgf3UcuCkckTmVgFFz5Fcf1wTm4s9YpfiESeAwvJVCJnvSNAf6pWSmL8wPhEctyJygvfwNtrn3avjE
PRIVY_AUTHORIZATION_KEY=wallet-auth:MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUScLP73++zciJPV6ghabKdrL3N2eTGCB9eMzP5Sq2M2hRANCAASaI9MIUZ+AcZEX/UTg98kDZNDzOv7YhGXhci62aFAy1yVAWOj+k0LM0l+iw4jzhWKy9CkFCrPLbnNk8QqirzGi
```

---

## 🚀 設置步驟

### 方法 1: Vercel Dashboard (推薦)

1. 去 https://vercel.com/dashboard
2. 點擊你的 `kindred` project
3. 上面選 **Settings** tab
4. 左邊選 **Environment Variables**
5. 逐一添加上面的變數：
   - Name: `DATABASE_URL`
   - Value: `postgresql://postgres:IBUILDKINDRED49@...`
   - Environment: **Production, Preview, Development** (全選)
   - 點 **Save**
6. 重複步驟 5，添加其他變數
7. 完成後，回到 **Deployments** tab
8. 最新的 deployment → 右邊 `...` 選單 → **Redeploy**

### 方法 2: Vercel CLI (快速)

```bash
cd /Users/jhinresh/clawd/team-kindred

# 安裝 Vercel CLI (如果沒有)
npm install -g vercel

# 登入
vercel login

# 設置環境變數
vercel env add DATABASE_URL production
# 貼上: postgresql://postgres:IBUILDKINDRED49@db.pmfefhiboklhrhxhgsex.supabase.co:5432/postgres?sslmode=require

vercel env add NEXT_PUBLIC_PRIVY_APP_ID production
# 貼上: cmkncaz3r0047ic0dtanwx48p

vercel env add GOOGLE_GENERATIVE_AI_API_KEY production
# 貼上: AIzaSyDgRXA83-aikivATuZbm4CnmyKLrY4G_lo

# Redeploy
vercel --prod
```

---

## ✅ 驗證

設置完後，檢查：

1. **Vercel Dashboard:**
   - Settings → Environment Variables
   - 應該看到 3 個變數（DATABASE_URL, NEXT_PUBLIC_PRIVY_APP_ID, GOOGLE_GENERATIVE_AI_API_KEY）

2. **Redeploy 後訪問:**
   - https://your-app.vercel.app
   - 應該不再看到 "Application error"

3. **測試功能:**
   - 首頁載入 ✅
   - Leaderboard 顯示數據 ✅
   - Connect Wallet 可用 ✅

---

## 🐛 如果還有錯誤

**查看 Runtime Logs:**

1. Vercel Dashboard → 你的 project
2. 選 **Deployments** tab
3. 點最新的 deployment → **View Function Logs**
4. 複製錯誤訊息給我

**常見錯誤：**

- `prisma client is not generated` → Redeploy
- `localStorage is not defined` → SSR 問題（已知，不影響）
- `Failed to fetch` → DATABASE_URL 格式錯誤

---

**Patrick Collins 🛡️**
