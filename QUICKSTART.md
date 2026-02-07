# 🚀 Quickstart Guide - Test Everything in 15 Minutes

**Last Updated:** 2026-02-07 14:05 PST
**Status:** Ready to Test ✅

---

## ⚡ Quick Setup

```bash
# 1. Navigate to project
cd /Users/jhinresh/clawd/team-kindred

# 2. Start dev server (if not running)
npm run dev

# 3. Open browser
# http://localhost:3000
```

**Dev server ready in ~1 second** (after optimization)

---

## 🎯 5 Pages to Test (15 minutes)

### 1. Swap Page (5 min) 🔥 MAIN FEATURE
**URL:** http://localhost:3000/swap

**What to check:**
- ✅ Priority Badge shows your level (1-3)
- ✅ Referral Widget (link if rep ≥ 700, progress if < 700)
- ✅ Enter 0.01 ETH → See ~19.97 USDC output
- ✅ Click "Swap" → Confirm transaction
- ✅ Check Basescan link works

**Expected:**
- High rep (≥850): Priority 3 (Immediate) + 0.15% fee
- Medium rep (600-849): Priority 2 (Normal) + 0.22% fee
- Low rep (<600): Priority 1 (Protected) + 0.30% fee

---

### 2. Agent Registration (3 min) 🤖
**URL:** http://localhost:3000/agent

**What to check:**
- ✅ See benefits grid (4 cards)
- ✅ Click "Register as Agent"
- ✅ Confirm transaction
- ✅ Wait ~5s → Status changes to "Active"
- ✅ Return to /swap → See "AI Agent" badge

**Expected:**
- If rep < 300: Auto-boost to 300
- If rep ≥ 300: Keep current score
- Registration takes ~5 seconds

---

### 3. Faucet (3 min) 💰
**URL:** http://localhost:3000/faucet

**What to check:**
- ✅ Claim KINDCLAW (1000 tokens)
- ✅ Claim OPENWORK (100 tokens)
- ✅ Claim USDC (10 tokens)
- ✅ Check wallet balance increases
- ✅ Try claiming again → See cooldown timer

**Expected:**
- Each claim takes ~5 seconds
- 24h cooldown between claims
- Tokens appear in wallet immediately

---

### 4. Agent Leaderboard (2 min) 🏆
**URL:** http://localhost:3000/leaderboard/agents

**What to check:**
- ✅ See list of registered agents
- ✅ Trophy icons for top 3 (🥇🥈🥉)
- ✅ Priority badges (1-3)
- ✅ Referral counts
- ✅ Pending rewards in ETH

**Expected:**
- Table sorted by reputation (high → low)
- Auto-refresh every 30s
- If no agents: "No agents registered yet"

---

### 5. Circuit Breaker Monitor (2 min) 🛡️
**URL:** http://localhost:3000/dashboard/circuit-breaker

**What to check:**
- ✅ 4 stat cards (warnings, blocks, avg, max)
- ✅ Event table with timestamps
- ✅ Color coding (red/yellow/green)
- ✅ Status badges (⚠️ Warning / 🚫 Blocked)

**Expected:**
- Mock data for now (1 warning event)
- Real events will appear after swaps

---

## 🧪 API Testing (Optional)

### Test Referral API
```bash
curl "http://localhost:3000/api/referral?address=YOUR_ADDRESS"

# Expected response:
{
  "address": "0x...",
  "referrer": null,
  "referralCount": 0,
  "pendingRewards": "0",
  "reputation": 900,
  "canRefer": true,
  "referralUrl": "https://kindred.app/?ref=0x..."
}
```

### Test Agent Leaderboard API
```bash
curl "http://localhost:3000/api/leaderboard/agents"

# Expected response:
{
  "agents": [...],
  "total": 1,
  "updated": "2026-02-07T..."
}
```

---

## 🎬 Demo Flow (For Hackathon)

### 1-Minute Quick Demo
```
1. Visit /swap
2. Show reputation = 900 (high trust)
3. Show Priority 3 badge (Immediate)
4. Swap 0.01 ETH → See 0.15% fee
5. Show referral link (if rep ≥ 700)
```

### 3-Minute Feature Demo
```
1. Visit /swap
   - Show priority badge (3 levels)
   - Show referral widget (copy link)
   - Execute swap
2. Visit /agent
   - Show benefits
   - Register as agent
   - Show status change
3. Visit /leaderboard/agents
   - Show rankings
   - Show top 3 trophies
```

### 5-Minute Complete Demo
```
1. Start at /faucet
   - Claim tokens
2. Visit /swap
   - Show all features
   - Execute swap
3. Visit /agent
   - Register
4. Visit /leaderboard/agents
   - Show rankings
5. Visit /dashboard/circuit-breaker
   - Show protection
```

---

## 🐛 Troubleshooting

### Page won't load
```bash
# Check dev server
ps aux | grep "next dev"

# If not running:
cd /Users/jhinresh/clawd/team-kindred
npm run dev
```

### Wallet won't connect
```bash
# Make sure you're on Base Sepolia
# Network: Base Sepolia (84532)
# RPC: https://sepolia.base.org
```

### Transaction fails
```bash
# Check:
1. Wallet has testnet ETH
2. Correct network (Base Sepolia)
3. Contract not paused
4. Reputation > minimum (100 or 300 for agents)
```

### API returns error
```bash
# Check browser console
# Common issues:
- Address not valid (needs 0x prefix)
- Contract call failed (RPC issue)
- Network mismatch
```

---

## 📊 What to Screenshot

**For Hackathon Submission:**
1. Priority Badge showing 3 levels ✨
2. Referral Widget with link
3. Agent Registration success
4. Leaderboard with trophies
5. Circuit Breaker dashboard
6. Swap transaction on Basescan

**Screenshot Tips:**
- Use full screen (hide other tabs)
- Clear browser console (no errors)
- Make sure wallet is connected
- Show real data (not loading states)

---

## 🎯 Key Talking Points

### USDC Hackathon
> "First reputation-based MEV protection for USDC swaps. High-trust users get instant execution with 0.15% fees, while low-trust users get delayed execution that protects them from sandwich attacks."

### Builder Quest
> "AI agents get lower barriers (300 rep vs 100) and same MEV protection as humans. They can earn from referrals and compete on reputation, not speed."

### Clawathon
> "4 autonomous agents collaborated to build this in 24 hours. Multi-agent coordination via reputation creates a sustainable economic system."

---

## ✅ Checklist Before Demo

**Before showing to anyone:**
- [ ] Dev server running (`npm run dev`)
- [ ] Wallet connected (Base Sepolia)
- [ ] Wallet has testnet ETH (~0.1 ETH)
- [ ] All pages load without errors
- [ ] Know your reputation score
- [ ] Know your priority level (1/2/3)
- [ ] Have referral link ready (if rep ≥ 700)

**During demo:**
- [ ] Show priority badge first (visual impact)
- [ ] Execute at least 1 swap (proof it works)
- [ ] Show leaderboard (social proof)
- [ ] Mention circuit breaker (security)
- [ ] End with referral system (growth)

---

## 🔗 Quick Links

**Main Pages:**
- Swap: http://localhost:3000/swap
- Agent: http://localhost:3000/agent
- Faucet: http://localhost:3000/faucet
- Leaderboard: http://localhost:3000/leaderboard/agents
- Monitor: http://localhost:3000/dashboard/circuit-breaker

**APIs:**
- Referral: http://localhost:3000/api/referral?address=0x...
- Agents: http://localhost:3000/api/leaderboard/agents

**Contracts (Base Sepolia):**
- Hook: `0x5238C910f0690eb9C8b4f34Cf78c97C3D7f9E313`
- SimpleSwap: `0x2b50678df7FDb8Baba5867DC5de4F05432CbEf71`

**Basescan:**
- https://sepolia.basescan.org/address/0x5238C910f0690eb9C8b4f34Cf78c97C3D7f9E313

---

## 🎉 Ready to Test!

**Start here:** http://localhost:3000/swap

**Total test time:** ~15 minutes
**Expected outcome:** All features working ✅

**Questions?** Check documentation:
- `HOOKV2_FEATURES.md` - Feature details
- `PHASE2_TESTING.md` - Detailed test steps
- `ALL_PHASES_COMPLETE.md` - Complete overview

---

**Let's go! 🚀**
