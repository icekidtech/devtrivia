// filepath: /home/icekid/Projects/devtrivia/frontend/tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo
        secondary: '#F59E0B', // Amber
        background: '#F3F4F6', // Light Gray
        foreground: '#1F2937', // Dark Gray
        darkBackground: '#1A202C', // Dark mode background
        darkForeground: '#E2E8F0', // Dark mode foreground
      },
    },
  },
  plugins: [],
};