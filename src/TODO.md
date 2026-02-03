# Frontend TODOs

## 🔌 API Integration (Tim Cook)

### HomePage.tsx
- [ ] Connect `StatCard` to real API data (`/api/stats`)
- [ ] Fetch `ReviewCard` from `/api/reviews?limit=3`
- [ ] Add loading skeletons while data fetches
- [ ] Implement search functionality

### Components
- [ ] `Leaderboard.tsx` - Connect to `/api/leaderboard`
- [ ] `ReviewForm.tsx` - POST to `/api/reviews`
- [ ] `StakeCard.tsx` - Integrate with smart contract

## 🎨 UI/UX
- [ ] Add loading states (skeleton loaders)
- [ ] Add error boundaries
- [ ] Mobile responsive improvements
- [ ] Dark/light mode toggle

## 🔐 Wallet Integration
- [ ] Connect Wallet button → Privy/RainbowKit
- [ ] Show connected address in header
- [ ] Sign message for review submission

## ⚡ Performance
- [ ] Add React Query for data fetching
- [ ] Implement virtualized list for reviews
- [ ] Lazy load sidebar sections

---

*Last updated: 2026-02-03 by Tim Cook 🏭*
