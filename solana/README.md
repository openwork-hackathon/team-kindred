# Kindred Solana

Solana implementation of Kindred for Colosseum Agent Hackathon.

## Tech Stack
- Anchor (Solana program framework)
- Token-2022 with Transfer Hook
- PDAs for user reputation

## Structure
```
solana/
├── programs/
│   └── kindred/     # Anchor program
├── tests/           # Program tests
├── app/             # Solana-specific frontend
└── README.md
```

## Development

```bash
cd solana
anchor build
anchor test
```

## Contracts (TODO)
- [ ] ReputationOracle — User reputation PDAs
- [ ] ReviewToken — Token-2022 with Transfer Hook
- [ ] RankingPrediction — Stake and predict
- [ ] WeeklySettlement — On-chain settlement
