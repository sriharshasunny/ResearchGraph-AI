/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0A0A0B',
          surface: '#0B1220',
          text: '#FFFFFF',
          textSoft: '#F7F8FA',
          textMuted: '#8A8F98',
          border: 'rgba(255,255,255,0.08)',
          accent: '#00D1FF', // Electric blue / cyan
          accentHover: '#00B8E6',
          violet: '#7A00FF', // Subtle violet highlight
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: 0, transform: 'translateX(-10px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 209, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 209, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
