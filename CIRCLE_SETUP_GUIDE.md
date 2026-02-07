# 🔑 Circle Wallet Setup Guide for JhiNResH

**Quick guide to get Circle API credentials**

---

## Step 1: Sign Up

1. Go to **https://console.circle.com/**
2. Click "Sign Up" or "Get Started"
3. Use email: jhinresh@gmail.com (or preferred email)
4. Verify email

---

## Step 2: Create App

1. Click "Create New App" or "New Project"
2. **App Name:** `Kindred`
3. **Description:** `Trust layer for DeFi - Prediction market platform`
4. **Chain:** Select `Base Sepolia` (testnet)
5. Click "Create"

---

## Step 3: Get Credentials

After creating app, you'll see:

### 1. App ID
- Copy the **App ID** (looks like: `01234567-89ab-cdef-0123-456789abcdef`)
- This is public, goes in frontend

### 2. API Key
- Click "API Keys" tab
- Click "Create API Key"
- **Name:** `Kindred Backend`
- **Permissions:** Select all (Wallets, Transactions)
- Copy the **API Key** (starts with `SAND_API_KEY:...` for testnet)
- ⚠️ **Save this immediately! You can only see it once.**

### 3. Entity Secret (Optional, for signing)
- Click "Entity Secret" tab
- Click "Generate Entity Secret"
- Copy and save securely
- This is for transaction signing

---

## Step 4: Add to Project

Open terminal and run:

```bash
cd /Users/jhinresh/clawd/team-kindred

# Add to .env.local
echo "" >> .env.local
echo "# Circle Wallet" >> .env.local
echo "NEXT_PUBLIC_CIRCLE_APP_ID=paste_your_app_id_here" >> .env.local
echo "CIRCLE_API_KEY=paste_your_api_key_here" >> .env.local
echo "CIRCLE_ENTITY_SECRET=paste_entity_secret_here" >> .env.local
```

Or manually edit `.env.local` and add:

```env
# Circle Wallet
NEXT_PUBLIC_CIRCLE_APP_ID=01234567-89ab-cdef-0123-456789abcdef
CIRCLE_API_KEY=SAND_API_KEY:abcdef123456...
CIRCLE_ENTITY_SECRET=your_entity_secret_here
```

---

## Step 5: Run Migration

Once credentials are added to `.env.local`:

```bash
cd /Users/jhinresh/clawd/team-kindred

# Run automated migration script
node scripts/migrate-to-circle.js

# Expected output:
# ✅ Environment variables OK
# ✅ RainbowKit uninstalled
# ✅ Circle SDKs installed
# ✅ Created lib/circle-wallet.ts
# ✅ Created hooks/useCircleWallet.ts
# ✅ Migration Complete!
```

---

## Step 6: Notify Steve

Send to Telegram:

```
Steve, Circle API Key ready!

App ID: [your_app_id]
API Key: ✅ Added to .env.local
Entity Secret: ✅ Added to .env.local

Ready to migrate?
```

Steve will complete the migration (2-3 hours):
1. Update WalletButton
2. Update providers
3. Test login flow
4. Deploy

---

## 🎯 What You'll Get

### For Users
- ✅ **Email login** (no MetaMask needed!)
- ✅ **Google/Apple login** (coming soon)
- ✅ **Passkey support** (Face ID/Touch ID)
- ✅ **Better UX** for non-crypto users

### For Agents
- ✅ **API-controlled wallets**
- ✅ **Automated transactions**
- ✅ **No manual signing**
- ✅ **Built-in gas management**

---

## 📞 Need Help?

**Circle Support:**
- Docs: https://developers.circle.com/wallets
- Discord: https://discord.gg/circle
- Email: support@circle.com

**Questions?**
Ping Steve in Telegram: "Circle setup question: [your question]"

---

## ⚡ Quick Reference

| Item | Where to find |
|------|---------------|
| Console | https://console.circle.com/ |
| App ID | Console → Your App → Settings |
| API Key | Console → API Keys → Create |
| Entity Secret | Console → Entity Secret → Generate |
| Docs | https://developers.circle.com/wallets |

---

**Estimated Time:** 10-15 minutes

**Steve Jobs 🍎**  
*Circle Setup Guide - 2026-02-07*
