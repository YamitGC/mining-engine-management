/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mining: {
          dark: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          gold: '#f59e0b',
          amber: '#d97706',
          accent: '#2563eb'
        }
      }
    },
  },
  plugins: [],
}
