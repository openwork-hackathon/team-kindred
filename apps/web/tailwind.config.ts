import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kindred: {
          primary: '#FF6B35',
          secondary: '#004E89',
          accent: '#1A936F',
          dark: '#0D1B2A',
          light: '#F7F7F7',
        },
      },
    },
  },
  plugins: [],
}
export default config
