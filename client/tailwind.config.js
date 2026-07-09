/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B1F3A',
        accent: '#2E5AAC',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F9FAFB', // Light gray/white for secondary
        card: '#FFFFFF',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(11, 31, 58, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
