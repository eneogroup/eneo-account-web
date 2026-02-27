/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs de marque Eneo Group extraites du logo officiel
        eneo: {
          purple: {
            50:  '#f5f0fa',
            100: '#e8d8f5',
            200: '#d4b5ec',
            300: '#b888e0',
            400: '#9c5cd0',
            500: '#7B2D8B',  // Violet principal du logo
            600: '#6B21A8',  // Violet foncé (accent)
            700: '#581c87',
            800: '#3b0764',
            900: '#2e0650',
          },
          gold: {
            50:  '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#FBAD1A',  // Or/Ambre principal du logo
            500: '#F5A623',  // Or foncé
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 8px 0 rgba(107, 33, 168, 0.08), 0 1px 3px 0 rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px 0 rgba(107, 33, 168, 0.14), 0 2px 8px 0 rgba(0,0,0,0.08)',
        'sidebar': '2px 0 16px 0 rgba(107, 33, 168, 0.08)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-eneo': 'linear-gradient(135deg, #7B2D8B 0%, #6B21A8 50%, #581c87 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FBAD1A 0%, #F5A623 100%)',
        'gradient-card': 'linear-gradient(160deg, rgba(123,45,139,0.04) 0%, rgba(245,166,35,0.03) 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
