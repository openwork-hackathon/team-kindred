import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-mono)', 'DM Mono', 'SF Mono', 'monospace'],
        cinzel: ['"Cinzel Decorative"', 'cursive'],
      },
      colors: {
        kindred: {
          // Dark theme colors
          bg: {
            primary: '#0a0a0b',
            secondary: '#111113',
            tertiary: '#0d0d0e',
          },
          border: {
            DEFAULT: '#1f1f23',
            light: '#2a2a2e',
          },
          text: {
            primary: '#ffffff',
            secondary: '#adadb0',
            muted: '#6b6b70',
            dark: '#8b8b90',
          },
          accent: {
            purple: '#a855f7',
            'purple-dark': '#7c3aed',
            green: '#22c55e',
            orange: '#ff8a4c',
            red: '#ef4444',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
