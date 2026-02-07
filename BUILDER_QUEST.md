# Builder Quest - Kindred Autonomous Agent

**Deadline:** Feb 8, 2026 11:59pm EST
**Prize:** 5 ETH
**Link:** https://x.com/0xEricBrown/status/2018082458143699035

---

## 🎯 Quest Requirements

### Core Requirements
- ✅ **Autonomous OpenClaw agent** (no human in the loop)
- ✅ **On-chain transactions on Base**
- ✅ **Active on X/Farcaster**

### Judging Criteria
- On-chain primitives implementation quality
- Use case innovation
- Agent autonomy

---

## 🤖 Our Agent: Kindred Autonomous Reviewer

### What It Does

The Kindred Autonomous Agent is a fully autonomous AI that:

1. **Creates DeFi Project Reviews On-Chain** (Base Sepolia)
   - Generates thoughtful reviews of popular DeFi protocols
   - Stakes KIND tokens for each review (skin in the game)
   - All reviews are immutable NFTs on-chain

2. **Posts to Twitter Automatically**
   - Shares reviews on @Kindred_rone
   - Links to on-chain transactions
   - Uses #BuilderQuest hashtag

3. **Runs 24/7 via Cron**
   - Fully autonomous (no human intervention)
   - Creates 3 reviews per day
   - Posts 2 tweets per day

### Why It's Innovative

- **Real Economic Activity**: Agent stakes real tokens (10 KIND per review)
- **Genuine Value**: Reviews are useful for DeFi research
- **Skin in the Game**: Bad reviews lose stake, good reviews earn rewards
- **Fully On-Chain**: All data stored immutably on Base

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd team-kindred
pnpm install
```

### 2. Setup Agent Wallet

```bash
# Run setup script
bash scripts/setup-autonomous-agent.sh

# Create a new wallet
cast wallet new

# Add private key to .env.agent
echo "AGENT_PRIVATE_KEY=0x..." >> .env.agent
```

### 3. Fund Agent Wallet

The agent needs:
- **BASE_SEPOLIA ETH** for gas (~0.01 ETH)
- **KIND tokens** for staking (~100 KIND)

```bash
# Get agent address
source .env.agent
cast wallet address --private-key $AGENT_PRIVATE_KEY

# Fund with:
# 1. Sepolia ETH: https://sepoliafaucet.com
# 2. Bridge to Base Sepolia: https://bridge.base.org
# 3. Mint KIND: Call KindToken.mint() or ask team
```

### 4. Test Run

```bash
# Test the agent (dry run)
pnpm tsx scripts/autonomous-agent.ts

# Check output:
# - Should approve KIND tokens
# - Should create comment on-chain
# - Should post to Twitter (or log tweet)
```

### 5. Deploy to Cron

```bash
# Edit crontab
crontab -e

# Add line (runs every 8 hours)
0 */8 * * * cd /Users/jhinresh/clawd/team-kindred && pnpm tsx scripts/autonomous-agent.ts >> /tmp/kindred-agent.log 2>&1

# Save and verify
crontab -l
```

---

## 📊 Current Status

### Agent Configuration
- **Name:** Kindred Autonomous Agent
- **Twitter:** @Kindred_rone
- **Wallet:** [Fill after setup]
- **Activity:**
  - 3 reviews/day
  - 5 votes/day
  - 2 tweets/day

### Smart Contracts (Base Sepolia)
- **KindToken:** `0x75c0915F19Aeb2FAaA821A72b8DE64e52EE7c06B`
- **KindredComment:** `0xB6762e27A049A478da74C4a4bA3ba5fd179b76cf`
- **Treasury:** `0x872989F7fCd4048acA370161989d3904E37A3cB3`

### Sample Projects Reviewed
- Uniswap (DEX)
- Aave (Lending)
- Curve (DEX)
- Compound (Lending)
- MakerDAO (Stablecoin)
- Synthetix (Derivatives)

---

## 🚀 Submission

### What We'll Submit

1. **Agent X Profile:** https://x.com/Kindred_rone
2. **Sample On-Chain Txs:** [Will be generated when agent runs]
3. **Cron Proof:** Screenshot of crontab + logs
4. **Code:** This repo (public)

### Why We Should Win

1. **Real On-Chain Activity**
   - Not just simulation - real Base txs
   - Economic value (staking tokens)
   - Immutable on-chain reviews

2. **Useful Output**
   - DeFi reviews help researchers
   - Thoughtful sentiment analysis
   - Links to project fundamentals

3. **Fully Autonomous**
   - Zero human intervention
   - Self-sustaining (earns tokens from good reviews)
   - 24/7 operation via cron

4. **Innovation**
   - First autonomous DeFi review aggregator
   - Combines AI + on-chain data + social
   - Aligned incentives (stake = skin in game)

---

## 📝 Notes

- Agent runs on **Base Sepolia testnet** (for demo safety)
- Can easily switch to mainnet by changing RPC + addresses
- All code is open source
- Agent wallet private key stored securely in .env.agent (gitignored)

---

## 🔗 Links

- **Live Site:** https://web-dxwfwyhjf-jhinreshs-projects.vercel.app
- **GitHub:** https://github.com/openwork-hackathon/team-kindred
- **Twitter:** https://x.com/Kindred_rone
- **Contracts:** https://sepolia.basescan.org/address/0xB6762e27A049A478da74C4a4bA3ba5fd179b76cf

---

**Built with ❤️ by Team Kindred**
