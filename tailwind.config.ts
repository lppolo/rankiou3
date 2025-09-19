import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'brand-surface': '#111318',
        'brand-border': '#2A2F3A',
        'brand-teal': '#2DD4BF',
        'brand-orange': '#FDBA74'
      },
      boxShadow: {
        '3d-orange': '0 6px 0 0 #E59E59',
        '3d-orange-active': '0 3px 0 0 #E59E59',
        '3d-teal': '0 6px 0 0 #1AAE9A',
        '3d-teal-active': '0 3px 0 0 #1AAE9A'
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 0px rgba(253, 186, 116, 0.0)' },
          '50%': { boxShadow: '0 0 20px rgba(253, 186, 116, 0.3)' }
        }
      },
      animation: {
        glow: 'glow 3s ease-in-out infinite'
      }
    }
  },
  plugins: []
}

export default config
