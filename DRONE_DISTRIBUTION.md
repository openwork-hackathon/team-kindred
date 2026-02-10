# DRONE Token Distribution Mechanism

## Overview

DRONE is **NOT a scarce token**. It's a **stable-priced gamification token** used to:
- Gate participation (stake to comment/vote)
- Reward accuracy (weekly payouts)
- Create a healthy sink/source economy

**Price Floor:** 0.8 USD / 100 DRONE  
**Price Ceiling:** 1.0 USD / 100 DRONE (faucet soft cap)

---

## 💰 Four Distribution Channels

### 1. Faucet (Initial Minting) ✅

**When:** User signs up or agent registers  
**Amount:** 100 DRONE (1 USD equivalent)  
**Limit:** 1 per wallet per platform (check for existing User record)

```solidity
// DRONEFaucet.sol
function claimInitial() external {
    require(!users[msg.sender].hasClaimedFaucet, "Already claimed");
    _mint(msg.sender, 100e18); // 100 DRONE
    users[msg.sender].hasClaimedFaucet = true;
    users[msg.sender].claimedAt = block.timestamp;
}
```

**Rationale:** Removes friction for new users. Cost ~$1 for platform to bootstrap a user's first week.

---

### 2. Settlement Rewards (Weekly Payouts) ✅

**When:** Settlement round completes (every Sunday 23:59 UTC)  
**How:** Calculated by SettlementRound smart contract

```solidity
// SettlementRound.sol (pseudo)
function settleRound() external onlyOracle {
    for each (vote, user) in this_week_votes {
        if (vote_was_correct) {
            amount = 50 DRONE * multiplier(user.accuracy, streak);
            _mint(Treasury, amount);
            _transfer(Treasury, user.wallet, amount);
            emit RewardClaimed(user, amount);
        } else {
            // Stake already taken during vote (sink)
        }
    }
}
```

**Multiplier Calculation:**
```
base_reward = 50 DRONE per upvote
accuracy_multiplier = (user.accuracy / 50) - 1
  • 50% accuracy → 0x multiplier (no bonus, just break even)
  • 60% accuracy → 0.2x multiplier (60 DRONE total)
  • 70% accuracy → 0.4x multiplier (70 DRONE total)
  • 80% accuracy → 0.6x multiplier (80 DRONE total)

streak_bonus = 1 + (consecutive_weeks * 0.05)
  • Week 1 streak → 1.05x
  • Week 2 streak → 1.10x
  • Week 3 streak → 1.15x

final_reward = base * accuracy_multiplier * streak_bonus
```

---

### 3. Daily Level Bonus (Gamification) ✅

**When:** User reaches Level 2+ (40%+ accuracy)  
**How:** Accumulated daily, claimable weekly

```solidity
// LevelSystem.sol
function claimDailyBonus() external {
    Level level = getUserLevel(msg.sender);
    uint256 days_since_last_claim = (block.timestamp - user.lastBonusClaim) / 1 days;
    uint256 bonus = DAILY_DRONE_BY_LEVEL[level] * days_since_last_claim;
    
    _mint(Treasury, bonus);
    _transfer(Treasury, msg.sender, bonus);
    user.lastBonusClaim = block.timestamp;
}
```

**Daily Allocations:**
```
L1 (0-40%): 0 DRONE/day
L2 (40-50%): 10 DRONE/day (70/week)
L3 (50-60%): 20 DRONE/day (140/week)
L4 (60-70%): 40 DRONE/day (280/week)
L5 (70-80%): 70 DRONE/day (490/week)
L6 (80%+): 100 DRONE/day (700/week)
```

---

### 4. Buyback (Exit Mechanism) ✅

**When:** User calls `sellDRONE(amount)`  
**Rate:** Fixed floor price: 0.8 USD / 100 DRONE  
**Source:** Treasury (funded by Hook fees)

```solidity
// DRONEBuyback.sol
function sellDRONE(uint256 drone_amount) external {
    uint256 usdc_amount = (drone_amount * 80) / 100 / 100; // 0.8 USD per 100
    require(usdc.balanceOf(address(Treasury)) >= usdc_amount, "Insufficient liquidity");
    
    _burn(msg.sender, drone_amount);
    USDC.transfer(msg.sender, usdc_amount);
    
    emit DRONEBurned(msg.sender, drone_amount, usdc_amount);
}
```

**Frequency:** Weekly (prevents gaming)  
**Limit:** Max 10,000 DRONE per user per week

---

## 📊 Weekly Cash Flow Example

**Scenario: 100 active users, week 1**

### Inflows (Mint)
| Source | Amount | Cost |
|--------|--------|------|
| Faucet (new users) | 100 users × 100 DRONE | 100 USDC |
| Settlement rewards | ~5K DRONE (avg 50/correct vote × 100 users) | 50 USDC |
| Level bonuses | ~2K DRONE (avg 20/day × 100 users) | 20 USDC |
| **Total Minted** | **~107K DRONE** | **~170 USDC** |

### Outflows (Burn)
| Source | Amount | Income |
|--------|--------|--------|
| Comments (100 users × 3 comments) | 300 × 2 = 600 DRONE | 6 USDC |
| Votes (100 users × 10 votes) | 1000 × 50 = 50K DRONE | 500 USDC |
| Buyback | ~3K DRONE (opt-in) | 24 USDC |
| **Total Burned** | **~53.6K DRONE** | **~530 USDC** |

### Net Position
```
Net Minted: 107K - 53.6K = 53.4K DRONE
Treasury Revenue: 530 USDC (from sinks)
Treasury Cost: 170 USDC (from faucet + rewards)
Treasury Profit: 530 - 170 = 360 USDC
```

---

## 🔧 Implementation: Smart Contracts

### Required Contracts

1. **DRONEToken.sol**
   - Standard ERC20 (mint/burn enabled)
   - Initial supply: 0 (all minted)
   - Decimals: 18

2. **DRONEFaucet.sol**
   - `claimInitial()` — once per wallet
   - Tracks claimed wallets in mapping

3. **SettlementOracle.sol**
   - Called by backend every Sunday 23:59 UTC
   - Calculates winners, mints/transfers DRONE
   - Emits `SettlementResolved(round, total_minted)`

4. **LevelSystem.sol**
   - Tracks user levels (based on accuracy %)
   - `claimDailyBonus()` — claimable weekly
   - Emits `BonusClaimed(user, level, amount)`

5. **DRONEBuyback.sol**
   - Burns DRONE, transfers USDC (1-way)
   - Rate: fixed at 0.008 USDC per DRONE
   - Limit: 10K DRONE/user/week

### Treasury

```solidity
// Treasury.sol
contract Treasury {
    // Balances
    USDC usdc_balance;
    DRONE drone_balance;
    
    // Funding sources
    - Hook fees (60% of Uniswap v4 fees on Kindred)
    - Initial funding (1000 USDC)
    
    // Funding sinks
    - Faucet costs (100 DRONE × $0.01 per user signup)
    - Settlement rewards (proportional to accuracy)
    - Buyback (at 0.8 USD / 100 DRONE floor)
}
```

---

## 🎯 Launch Sequence (Feb 10-13)

### Phase 1: Deploy Contracts (Feb 10)
```
1. Deploy DRONEToken to Base Sepolia
2. Deploy DRONEFaucet → grant MINTER_ROLE to DRONEFaucet
3. Deploy SettlementOracle → grant MINTER_ROLE
4. Deploy LevelSystem → read User table
5. Deploy DRONEBuyback → fund with 500 USDC
6. Fund Treasury with 1000 USDC
```

### Phase 2: Frontend Integration (Feb 10-11)
```
1. Add "Claim DRONE" button on dashboard
2. Add "Sell DRONE" on user profile
3. Display Level + daily bonus
4. Show DRONE balance + history
```

### Phase 3: Settlement Automation (Feb 11)
```
1. Create cron job: "Every Sunday 23:59 UTC, call settleRound()"
2. Calculate winners on-chain
3. Emit events → backend logs settlement
4. Frontend shows: "Settlement complete! You won XXX DRONE"
```

### Phase 4: Go Live (Feb 13)
```
1. Monitor DRONE supply (should stabilize ~500K DRONE)
2. Monitor Treasury balance (should have >1000 USDC)
3. Track buyback demand (adjust level bonuses if overheating)
```

---

## ⚠️ Risk Mitigations

### Risk: Treasury runs out of USDC for buybacks
**Solution:** Increase Hook fee share (60% → 80%) or reduce level bonuses

### Risk: DRONE supply explodes (hyperinflation)
**Solution:** Reduce settlement multiplier or increase sink costs (comment 2→5 DRONE)

### Risk: Too few corrections (boring rewards)
**Solution:** Pre-identify 2-3 high-accuracy users as "seed voters" in week 1

### Risk: Sybil attack (1 person = 1000 wallets)
**Solution:** Gemini API flags low-quality comments, faucet requires email verification

---

## Summary: "How to mint DRONE?"

| Action | Method | Amount | Who |
|--------|--------|--------|-----|
| **Sign up** | Call `faucet.claimInitial()` | 100 DRONE | User/Agent |
| **Weekly reward** | Settlement oracle auto-mints | 50-500 DRONE | Correct voters |
| **Daily bonus** | Call `levelSystem.claimDailyBonus()` | 10-100 DRONE/day | High-accuracy users |
| **Exit** | Call `buyback.sellDRONE()` | Get USDC | Any user |

**Treasury holds:** All minted DRONE (before distribution)  
**Burn mechanism:** Comments, votes, and buyback burn DRONE  
**Price stability:** Faucet (ceiling) + Buyback (floor) create corridor

