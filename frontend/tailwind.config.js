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
        canvas: '#070a12',
        surface: {
          50: '#1b2234',
          100: '#151c2c',
          200: '#101524',
          300: '#0b0f19',
          400: '#070a12',
        },
        mining: {
          gold: '#f59e0b',
          amber: '#d97706',
          bright: '#fbbf24',
          glow: 'rgba(245, 158, 11, 0.15)',
        }
      },
      backgroundImage: {
        'radial-grid': 'radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
        'mesh-glow': 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 60%)',
      },
      boxShadow: {
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.07)',
        'bento-card': '0 0 0 1px rgba(255, 255, 255, 0.06), 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
