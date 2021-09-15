module.exports = {
  purge: {
    // Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    enabled: process.env.APP_ENV === 'production',
    content: [
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'components/**/*.pug',
      'layouts/**/*.pug',
      'layout/**/*.pug',
      'pages/**/*.pug',
      'plugins/**/*.js',
      'nuxt.config.js'
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        green: {
          light: '#EEF9F2',
          medium: '#D5ECE2',
          brand: '#219436',
        },
        gray: {
          lighter: '#F1F3F1',
          light: '#C6CEC8',
          medium: '#8D9C92',
          dark: '#3F4942',
          darker: '#4F4F4F'
        },
        red: {
          medium: '#EB5757'
        }
      },
      screens: {
        md: '640px',
        lg: '960px',
        xl: '1200px',
        xxl: '1600px'
      },
      fontFamily: {
        body: ['Poppins', 'sans-serif']
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
