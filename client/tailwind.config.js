/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        honey: {
          50: '#FFFDF5',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          amber: '#F59E0B',
          glow: '#FCD34D',
        },
        cream: {
          50: '#FFFEFA',
          100: '#FFFDF5',
          200: '#FFFBEB',
          300: '#FEF3C7',
          400: '#FDE68A',
          parchment: '#FDF8EE',
          warm: '#FBF5E6',
        },
        oak: {
          50: '#FDF8F6',
          100: '#F2E8E5',
          200: '#EAD3CD',
          400: '#B45309',
          600: '#78350F',
          700: '#5A260B',
          800: '#451A03',
          900: '#2A0F02',
          deep: '#1C0A01',
        },
        pixel: {
          border: '#1E1B18',
          shadow: '#141210',
          panel: '#FFFDF5',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        retro: ['"VT323"', 'monospace'],
        mono: ['"Courier Prime"', 'Courier', 'monospace'],
      },
      boxShadow: {
        'pixel-sm': '2px 2px 0px #1E1B18',
        'pixel': '4px 4px 0px #1E1B18',
        'pixel-lg': '6px 6px 0px #1E1B18',
        'pixel-xl': '8px 8px 0px #1E1B18',
        'pixel-amber': '4px 4px 0px #B45309',
        'pixel-inset': 'inset 3px 3px 0px rgba(0, 0, 0, 0.12)',
      },
      borderWidth: {
        '3': '3px',
        '5': '5px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'buzz': 'buzz 0.5s ease-in-out infinite',
        'gentle-pulse': 'gentlePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        buzz: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(1px, -1px) rotate(1deg)' },
          '75%': { transform: 'translate(-1px, 1px) rotate(-1deg)' },
        },
        gentlePulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      },
    },
  },
  plugins: [],
};
