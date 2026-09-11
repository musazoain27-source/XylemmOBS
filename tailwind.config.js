/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#f3f5f4',
          100: '#e4e8e6',
          200: '#c7d0cc',
          300: '#a2b0ab',
          400: '#7c8c86',
          500: '#4a544e',
          600: '#343c38',
          700: '#262c29',
          800: '#1c211f',
          850: '#161a18',
          900: '#111413',
          925: '#0e1110',
          950: '#0b0d0c',
        },
        moss: {
          950: '#04140c',
          900: '#062e1a',
          800: '#0a4327',
          700: '#105934',
          600: '#177243',
          500: '#218c54',
          400: '#3aab6e',
          300: '#66c790',
          200: '#a3e0bd',
          100: '#d6f5e3',
        },
        ember: {
          300: '#ffada4',
          400: '#ff8a7f',
          500: '#ff6b5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        pixel: ['"Press Start 2P"', '"Courier New"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(58, 171, 110, 0.15), 0 8px 30px -8px rgba(6, 46, 26, 0.6)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pop: { '0%': { transform: 'scale(0.97)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out both',
        pop: 'pop 0.15s ease-out both',
      },
    },
  },
  plugins: [],
};
