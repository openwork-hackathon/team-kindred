'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu, X, Home, BarChart3, Briefcase, Trophy, Coins } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/app', label: 'App', icon: Home },
  { href: '/markets', label: 'Markets', icon: BarChart3 },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold">🦞 KINDRED</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'text-[#adadb0] hover:text-white hover:bg-[#1f1f23]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a 
              href="https://mint.club/token/base/KIND" 
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-500/10 text-purple-400 rounded-md hover:bg-purple-500/20 transition"
            >
              <Coins className="w-3 h-3" />
              Buy $KIND
            </a>
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#adadb0] hover:text-white transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1f1f23] bg-[#0a0a0b]">
          <nav className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'text-[#adadb0] hover:text-white hover:bg-[#1f1f23]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          {/* Mobile Actions */}
          <div className="px-4 py-4 border-t border-[#1f1f23] space-y-3">
            <a 
              href="https://mint.club/token/base/KIND" 
              target="_blank"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-500/10 text-purple-400 rounded-lg text-sm hover:bg-purple-500/20 transition"
            >
              <Coins className="w-4 h-4" />
              Buy $KIND Token
            </a>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navigation
