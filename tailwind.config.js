/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'background': 'var(--color-background)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        gray: {
          900: '#121212', // Spotify black
          800: '#181818', // Spotify dark gray
          700: '#282828', // Spotify light gray
        },
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        success: 'var(--color-success)',
      },
      animation: {
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          },
        },
      },
    },
  },
  plugins: [],
};