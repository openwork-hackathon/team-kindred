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
          primary: '#572f61', // New Primary (Deep Purple)
          bg: {
            primary: '#1a0e2e', // New Background (Deepest Purple)
            secondary: '#24123d', // Slightly lighter for cards
            tertiary: '#2d164d', // Borders/Accents
          },
          border: {
            DEFAULT: '#2d164d',
            light: '#572f61',
          },
          text: {
            primary: '#d9d4e8', // New Text Highlight
            secondary: '#adadb0',
            muted: '#6b6b70',
            dark: '#8b8b90',
          },
          accent: {
            purple: '#d9d4e8', // Use Highlight as accent
            'purple-dark': '#572f61',
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
