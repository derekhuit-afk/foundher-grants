import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          50: '#fdf6f0', 100: '#fae8d8', 200: '#f4c9a8', 300: '#eca676',
          400: '#e07d45', 500: '#c75f28', 600: '#a8481e', 700: '#883519',
          800: '#6b2815', 900: '#521e11'
        },
        forest: {
          50: '#f1f6f1', 100: '#d8ebd8', 200: '#a8d3a8', 300: '#72b672',
          400: '#4a9a4a', 500: '#327a32', 600: '#266226', 700: '#1d4d1d',
          800: '#163b16', 900: '#0f2b0f'
        },
        sand: {
          50: '#fdfbf7', 100: '#f8f2e6', 200: '#f0e2c4', 300: '#e4ca98',
          400: '#d4ae68', 500: '#be9040', 600: '#9e7330', 700: '#7d5a25',
          800: '#60431c', 900: '#473114'
        },
        cream: '#fdfaf5',
        charcoal: '#1c1917',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Lora', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
