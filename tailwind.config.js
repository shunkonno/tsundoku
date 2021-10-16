const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './daily/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      // Build your palette here
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      blueGray: colors.blueGray,
      blue: colors.blue,
      indigo: colors.indigo,
      purple: colors.purple,
      red: colors.red,
      green: colors.green,
      teal: colors.teal,
      yellow: colors.yellow,
      orange: colors.orange,
      tsundoku: {
        blue: {
          main: '#1877F2',
          sub: '#B5DBFF',
          light: '#EEF7FF',
          dark: '#1A2D45'
        },
        brown: {
          main: '#AD7E47',
          sub: '#DAB182'
        }
      }
    },
    
    extend: {
      fontFamily: {
        NotoSerif: ['Noto Serif JP'],
        NotoSans: ['Noto Sans JP']
      },
      height: {
				"10v": "10vh",
				"20v": "20vh",
				"30v": "30vh",
				"40v": "40vh",
				"50v": "50vh",
				"60v": "60vh",
				"70v": "70vh",
				"80v": "80vh",
				"90v": "90vh",
				"100v": "100vh",
			},
    }
  },
  variants: {
    extend: {}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ]
}
