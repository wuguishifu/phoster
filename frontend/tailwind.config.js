/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors: {
      blue: '#6C63FF',
      grey: '#888888',
      lightGrey: '#E6E6E6',
      white: '#FFFFFF',
      black: '#000000'
    },
    extend: {
      animation: {
        'fade-in': 'fade-in 1s'
      },
      keyframes: {
        'fade-in': {
          '0%': {
            transform: 'translateY(40px)',
            opacity: 0
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: 1
          }
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-animation-delay'),
    require('tailwindcss-animate')
  ],
}