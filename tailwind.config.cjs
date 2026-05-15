module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'dark': {
          'bg': '#0f0f11',
          'card': '#1a1a1e',
          'input': '#252529',
        },
        'gold': {
          '50': '#fffbee',
          'DEFAULT': '#c9a84c',
          'light': '#e8d4a6',
          'dark': '#9d7c35',
        },
        'border': '#2e2e32',
        'text': {
          'primary': '#f5f5f2',
          'secondary': '#b8b8b4',
          'tertiary': '#7a7a75',
        }
      },
      fontFamily: {
        'serif': ['Cormorant Garamond', 'serif'],
        'sans': ['DM Sans', 'sans-serif'],
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        'mobile': '24px',
      }
    },
  },
  plugins: [],
}
