const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      // Build your palette here
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      blue: colors.blue,
      indigo: colors.indigo,
      red: colors.red,
      yellow: colors.yellow,
      orange: colors.orange,
      tsundoku: {
        blue: {
          main: '#1877F2',
          sub: '#B5DBFF',
          light: '#EEF7FF',
          dark: '#1A2D45',
        },
        brown: {
          main: '#AD7E47',
          sub: '#DAB182'
        }
      }
    },
    extend: {
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}