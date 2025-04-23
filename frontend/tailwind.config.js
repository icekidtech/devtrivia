// filepath: /home/icekid/Projects/devtrivia/frontend/tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#00D4FF',
        secondary: '#FF00FF',
        success: '#39FF14',
        error: '#FF5555',
        'cyan': {
          400: '#00D4FF', // was primary
        },
        'fuchsia': {
          500: '#FF00FF', // was secondary
        },
        'lime': {
          400: '#39FF14', // was success
        },
        'red': {
          400: '#FF5555', // was error
        },
        'slate': {
          900: '#1A1A2E', // was background
        }
      },
      backgroundColor: {
        'background': '#1A1A2E', // Define your background color here
      },
      textColor: {
        'foreground': '#E0E0E0', // Define your foreground color here
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00D4FF, 0 0 15px rgba(0, 212, 255, 0.5)',
        'neon-magenta': '0 0 5px #FF00FF, 0 0 15px rgba(255, 0, 255, 0.5)',
        'neon-green': '0 0 5px #39FF14, 0 0 15px rgba(57, 255, 20, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    // Add this if you created the text shadow plugin
    require('./tailwind-plugins/textShadow'),
  ],
};