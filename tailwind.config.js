/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0E6B3C',       // campaign green (primary)
          950: '#052E17',
          900: '#083D21',
          800: '#0B4E2A',
          700: '#0E6034',
          600: '#11723E',
          500: '#178946',
          400: '#2CAC5B',
          300: '#61CE8A',
          200: '#9CE4B8',
          100: '#CEF3DD',
          50:  '#EBFAF1',
        },
        yellow: {
          DEFAULT: '#F5C518',       // campaign yellow (secondary)
          600: '#D8A400',
          500: '#EFBC18',
          400: '#F5C93C',
          300: '#F7D66B',
          200: '#FAE6A0',
          100: '#FDF1C9',
          50:  '#FEF9E7',
        },
        red: {
          DEFAULT: '#D62828',       // campaign red (accent)
          700: '#A61313',
          800: '#8A0F0F',
          600: '#C01E1E',
          500: '#D62828',
          400: '#E35151',
          300: '#EF8383',
          200: '#F6BABA',
          100: '#FBDCDC',
          50:  '#FEF0F0',
        },
        paper: { DEFAULT: '#F7F5EF', soft: '#FAF9F4' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(13 18 16 / 0.06), 0 4px 16px rgb(13 18 16 / 0.08)',
        'card-hover': '0 4px 10px rgb(13 18 16 / 0.10), 0 16px 40px rgb(13 18 16 / 0.14)',
        yellow: '0 6px 24px rgb(245 197 24 / 0.35)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'float-slow': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};
