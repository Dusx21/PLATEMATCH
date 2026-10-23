/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aubergine: {
          DEFAULT: '#2A1455',
          50: '#F5F2FA',
          100: '#E8E1F3',
          200: '#D1C2E7',
          300: '#B097D6',
          400: '#8A67C1',
          500: '#6840AA',
          600: '#4D2A8E',
          700: '#3D1E75',
          800: '#2A1455',
          900: '#1B0A3B',
          950: '#0E0421',
        },
        chili: {
          DEFAULT: '#FF5A3C',
          light: '#FF7D66',
          dark: '#E03F22',
          surface: '#FFF0ED',
        },
        mango: {
          DEFAULT: '#FF9F1C',
          light: '#FFB854',
          dark: '#E08304',
          surface: '#FFF7ED',
        },
        mint: {
          DEFAULT: '#19C37D',
          light: '#3CD896',
          dark: '#119B61',
          surface: '#EDFBF4',
        },
        cream: {
          DEFAULT: '#FFF3E4',
          50: '#FFFFFF',
          100: '#FFFDF9',
          200: '#FFF8F0',
          300: '#FFF3E4',
          400: '#FFE7C7',
          500: '#FFD7A3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 10px 30px -5px rgba(42, 20, 85, 0.08), 0 4px 12px -2px rgba(42, 20, 85, 0.04)',
        'card-hover': '0 20px 40px -10px rgba(42, 20, 85, 0.16), 0 8px 16px -4px rgba(42, 20, 85, 0.08)',
        'float': '0 12px 32px 0 rgba(42, 20, 85, 0.14)',
        'modal': '0 25px 50px -12px rgba(42, 20, 85, 0.25)',
      },
      borderRadius: {
        'card': '24px',
        'modal': '28px',
        'badge': '12px',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.03)' },
        },
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
