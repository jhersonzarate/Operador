/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080b14',
        surface: '#0e1420',
        'surface-2': '#141c2e',
        border: '#1e2a42',
        'border-light': '#2a3a56',
        primary: '#863bff',
        'primary-hover': '#9a55ff',
        'primary-dim': 'rgba(134,59,255,0.15)',
        accent: '#47bfff',
        'accent-dim': 'rgba(71,191,255,0.12)',
        muted: '#4a5a7a',
        text: '#e8edf8',
        'text-secondary': '#8899bb',
        success: '#22d3a0',
        warning: '#f59e0b',
        danger: '#f43f5e',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      backgroundImage: {
        'glow-primary': 'radial-gradient(ellipse at center, rgba(134,59,255,0.18) 0%, transparent 70%)',
        'glow-accent': 'radial-gradient(ellipse at center, rgba(71,191,255,0.12) 0%, transparent 70%)',
        'grid-pattern': 'linear-gradient(rgba(134,59,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(134,59,255,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(134,59,255,0.25)',
        'glow-sm': '0 0 15px rgba(134,59,255,0.15)',
        'glow-accent': '0 0 20px rgba(71,191,255,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      screens: {
        'xs': '390px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}