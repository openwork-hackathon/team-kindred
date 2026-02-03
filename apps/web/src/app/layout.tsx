import type { Metadata } from 'next'
import { Inter, DM_Mono } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'

// Dynamic import to avoid SSR issues with wagmi/RainbowKit localStorage access
const Providers = dynamic(() => import('./providers').then(mod => mod.Providers), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-pulse text-white">Loading...</div>
    </div>
  ),
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

const dmMono = DM_Mono({ 
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'Kindred | Trust Layer for Everyone',
  description: 'A Web3 review platform where reputation has real value',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${inter.variable} ${dmMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
