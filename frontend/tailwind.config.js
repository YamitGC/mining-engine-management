/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        canvas: '#0B0F17',
        mining: {
          dark: '#0B0F17',
          surface: '#121722',
          card: '#161E2C',
          hover: '#1D273A',
          border: 'rgba(245, 158, 11, 0.15)',
          gold: '#F59E0B',
          yellow: '#EAB308',
          bright: '#FDE047',
          amber: '#D97706',
          orange: '#EA580C',
          rust: '#C2410C',
          slate: '#334155',
          steel: '#475569',
        }
      },
      backgroundImage: {
        'hazard-pattern': 'repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.15) 0, rgba(245, 158, 11, 0.15) 10px, transparent 10px, transparent 20px)',
        'hazard-strong': 'repeating-linear-gradient(45deg, #F59E0B 0, #F59E0B 12px, #0B0F17 12px, #0B0F17 24px)',
        'steel-plate': 'radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px -3px rgba(245, 158, 11, 0.25)',
        'orange-glow': '0 0 25px -3px rgba(234, 88, 12, 0.25)',
        'industrial-card': '0 4px 20px -2px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      }
    },
  },
  plugins: [],
}

