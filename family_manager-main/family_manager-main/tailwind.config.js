/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'base-blue': '#0052FF',
        'base-blue-dark': '#0041CC',
        'light-bg': '#F5F8FA',
        'light-text': '#6B7280',
        'dark-text': '#1F2937',
      },
    },
  },
  plugins: [],
};
