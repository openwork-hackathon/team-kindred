import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic' // wagmi/RainbowKit needs browser APIs

// Redirect /trending to /leaderboard
export default function TrendingPage() {
  redirect('/leaderboard')
}
