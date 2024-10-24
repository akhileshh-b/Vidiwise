module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f5f5f5',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
        },
        accent: {
          primary: '#3b82f6', // blue-500
        }
      }
    },
  },
  plugins: [],
}