/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'gridiron': {
          // Dark theme colors (default)
          'bg-primary': 'var(--gridiron-bg-primary)',
          'bg-secondary': 'var(--gridiron-bg-secondary)',
          'bg-tertiary': 'var(--gridiron-bg-tertiary)',
          'bg-card': 'var(--gridiron-bg-card)',
          'border-subtle': 'var(--gridiron-border-subtle)',
          'border-emphasis': 'var(--gridiron-border-emphasis)',
          'text-primary': 'var(--gridiron-text-primary)',
          'text-secondary': 'var(--gridiron-text-secondary)',
          'text-muted': 'var(--gridiron-text-muted)',
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
