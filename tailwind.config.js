/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gridiron': {
          'bg-primary': '#0a0a0f',
          'bg-secondary': '#12121a',
          'bg-tertiary': '#1a1a24',
          'bg-card': '#1e1e2a',
          'border-subtle': '#2a2a3a',
          'border-emphasis': '#3a3a4a',
          'text-primary': '#ffffff',
          'text-secondary': '#a0a0b0',
          'text-muted': '#606070',
          'accent': '#00d4aa',
          'win': '#22c55e',
          'loss': '#ef4444',
          'warning': '#f59e0b',
          'live': '#ef4444',
        }
      },
      fontFamily: {
        'display': ['Oswald', 'sans-serif'],
        'body': ['IBM Plex Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
