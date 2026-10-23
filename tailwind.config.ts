import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // strict 8px grid: only multiples of 8 (plus 4 for hairline gaps)
    spacing: {
      0: '0', px: '1px', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 7: '28px',
      8: '32px', 10: '40px', 12: '48px', 14: '56px', 16: '64px', 20: '80px', 24: '96px', 28: '112px', 32: '128px', 40: '160px',
    },
    borderRadius: { none: '0', sm: '4px', DEFAULT: '8px', md: '8px', lg: '12px', full: '9999px' },
    boxShadow: { none: 'none' },
    extend: {
      colors: {
        sand: '#F5F0E8',
        surface: '#FFFFFF',
        stage: '#0E0C0B',
        'stage-surface': '#1A1715',
        maroon: '#8A1538',
        coral: '#FF4D4D',
        gold: '#B8935A',
        ink: '#2A2420',
        warm: '#6B625A',
        line: '#D9D1C7',
      },
      fontFamily: {
        ui: ['"IBM Plex Sans Arabic"', '"IBM Plex Sans"', 'sans-serif'],
        kufi: ['"Noto Kufi Arabic"', '"IBM Plex Sans Arabic"', 'sans-serif'],
        en: ['"IBM Plex Sans"', '"IBM Plex Sans Arabic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
