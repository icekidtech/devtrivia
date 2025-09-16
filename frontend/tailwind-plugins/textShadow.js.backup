const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  const newUtilities = {
    '.text-shadow-sm': {
      'text-shadow': '0 0 5px rgba(0, 212, 255, 1), 0 0 10px rgba(0, 212, 255, 0.5)',
    },
    '.text-shadow': {
      'text-shadow': '0 0 10px rgba(0, 212, 255, 1), 0 0 20px rgba(0, 212, 255, 0.5)',
    },
    '.text-shadow-lg': {
      'text-shadow': '0 0 15px rgba(0, 212, 255, 1), 0 0 30px rgba(0, 212, 255, 0.5)',
    },
  };
  
  addUtilities(newUtilities);
});