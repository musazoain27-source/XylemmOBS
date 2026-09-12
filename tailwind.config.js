/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral black/graphite scale — the "black" half of the theme.
        charcoal: {
          50: '#f4f6f9',
          100: '#e6eaf0',
          200: '#c8d0dc',
          300: '#9aa7b8',
          400: '#6b7788',
          500: '#4a5568',
          600: '#333d4d',
          700: '#1c212b',
          800: '#12151c',
          850: '#0a0c11',
          900: '#050609',
          925: '#020304',
          950: '#000000',
        },
        // Electric blue accent — the "blue" half of the theme. Kept the
        // "moss" key name so every existing component class (moss-400,
        // moss-500, etc.) just picks up the new color automatically.
        moss: {
          950: '#040d21',
          900: '#07173d',
          800: '#0b2358',
          700: '#0f3178',
          600: '#1447a3',
          500: '#2f6fe0',
          400: '#5b8ff5',
          300: '#8aafff',
          200: '#bad0ff',
          100: '#dde9ff',
        },
        ember: {
          300: '#ffada4',
          400: '#ff8a7f',
          500: '#ff6b5e',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        pixel: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(47, 111, 224, 0.18), 0 8px 30px -8px rgba(7, 23, 61, 0.7)',
        'glow-lg': '0 0 0 1px rgba(47, 111, 224, 0.25), 0 20px 60px -12px rgba(7, 23, 61, 0.85)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pageIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pop: { '0%': { transform: 'scale(0.97)' }, '100%': { transform: 'scale(1)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glowPulse: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out both',
        fadeInUp: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        pageIn: 'pageIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
        pop: 'pop 0.15s ease-out both',
        float: 'float 6s ease-in-out infinite',
        glowPulse: 'glowPulse 4s ease-in-out infinite',
        gradientShift: 'gradientShift 8s ease infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
