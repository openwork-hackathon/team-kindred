import { redirect } from 'next/navigation'

// Redirect /trending to /leaderboard
export default function TrendingPage() {
  redirect('/leaderboard')
}
