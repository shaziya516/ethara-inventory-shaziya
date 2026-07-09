/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#fdf2f1',
          100: '#fce4e1',
          200: '#f9cac6',
          300: '#f4a09a',
          400: '#ec6d65',
          500: '#df4238',
          600: '#c0392b',
          700: '#a93226',
          800: '#8c2a21',
          900: '#75271f',
          950: '#3f100d',
        },
        cream: {
          50:  '#fafaf8',
          100: '#f4f0ec',
          200: '#eae4dc',
          300: '#ddd5ca',
        },
        ink: {
          100: '#ebebeb',
          200: '#d4d4d4',
          300: '#b0b0b0',
          400: '#8a8a8a',
          500: '#6b6b6b',
          700: '#3d3d3d',
          900: '#1a1a1a',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'spin':     'spin 0.7s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
