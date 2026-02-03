# Kindred API Documentation

Base URL: `/api`

---

## Reviews

### List Reviews
```http
GET /api/reviews
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| category | string | Filter by category (k/defi, k/memecoin, k/perp-dex, k/ai) |
| target | string | Filter by target address or name |
| sort | string | Sort order: hot (default), new, top |

**Response:**
```json
{
  "reviews": [...],
  "total": 10
}
```

### Create Review
```http
POST /api/reviews
```

**Body:**
```json
{
  "targetAddress": "0x...",
  "targetName": "Aave",
  "rating": 5,
  "content": "Great protocol...",
  "category": "k/defi",
  "predictedRank": 2,
  "stakeAmount": "1000000000000000000",
  "photoUrls": []
}
```

### Vote on Review
```http
POST /api/reviews/[id]/vote
```

**Body:**
```json
{
  "direction": "up",
  "voterAddress": "0x..."
}
```

---

## Leaderboard

### Get Rankings
```http
GET /api/leaderboard
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| category | string | Filter by category |
| limit | number | Max results (default 20) |
| offset | number | Pagination offset |

**Response:**
```json
{
  "leaderboard": [...],
  "total": 5,
  "categories": ["k/defi", "k/memecoin", "k/perp-dex", "k/ai"],
  "lastUpdated": "2026-02-03T...",
  "nextSettlement": "2026-02-09T00:00:00.000Z"
}
```

---

## Stakes

### List Stakes
```http
GET /api/stakes
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| address | string | Filter by staker address |
| project | string | Filter by project address |
| status | string | Filter by status (active, won, lost, pending) |

### Create Stake
```http
POST /api/stakes
```

**Body:**
```json
{
  "stakerAddress": "0x...",
  "projectAddress": "0x...",
  "projectName": "Hyperliquid",
  "predictedRank": 1,
  "amount": "5000000000000000000"
}
```

---

## Users

### Get User Reputation
```http
GET /api/users/[address]
```

**Response:**
```json
{
  "address": "0x...",
  "displayName": "DeFiChad.eth",
  "totalReviews": 45,
  "totalUpvotes": 320,
  "totalStaked": "50000000000000000000",
  "reputationScore": 2450,
  "level": "trusted",
  "badges": ["Active Reviewer", "Predictor"]
}
```

---

## Polymarket Integration

### List Markets
```http
GET /api/polymarket
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| limit | number | Max results (default 20) |
| category | string | Filter by category |
| trending | boolean | Get trending markets |

**Response:**
```json
{
  "markets": [
    {
      "id": "123",
      "question": "Will Bitcoin reach $100k?",
      "slug": "bitcoin-100k",
      "category": "k/defi",
      "outcomes": [
        { "name": "Yes", "price": 0.65, "probability": 65 },
        { "name": "No", "price": 0.35, "probability": 35 }
      ],
      "volume": 1500000,
      "volume24hr": 50000,
      "liquidity": 200000,
      "url": "https://polymarket.com/event/bitcoin-100k"
    }
  ],
  "total": 20,
  "source": "polymarket",
  "fetchedAt": "2026-02-03T..."
}
```

### Get Single Market
```http
GET /api/polymarket/[slug]
```

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message"
}
```

Common status codes:
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## Categories

| Category | Description |
|----------|-------------|
| k/defi | DeFi protocols |
| k/memecoin | Memecoins |
| k/perp-dex | Perpetual DEXes |
| k/ai | AI projects |
| k/politics | Political markets |
| k/sports | Sports markets |

---

## Reputation Levels

| Level | Score Required |
|-------|----------------|
| newcomer | 0 |
| contributor | 100 |
| trusted | 1,000 |
| expert | 5,000 |
| authority | 10,000 |
