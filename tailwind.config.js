/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Adjust these paths if your components are in 'src/'
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // You can define custom colors, fonts, etc. here if needed later.
    },
  },
  plugins: [
    // Include any Tailwind plugins you are using here.
    require('tailwindcss-animate'), // Make sure this is installed: npm install tailwindcss-animate
  ],
  // THIS IS THE CRUCIAL PART TO PREVENT LAB() COLORS
  corePlugins: {
    preflight: false, // Disables Tailwind's Preflight, which can generate modern color formats
  },
};