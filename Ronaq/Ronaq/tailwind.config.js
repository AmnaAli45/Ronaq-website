/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ronaq: {
          dark: '#111827',
          gold: '#D4AF37',
          lightGold: '#F3E5AB',
          cream: '#FAF7F2',
          charcoal: '#1F2937',
          gray: '#F3F4F6'
        },
        velora: {
          bg: '#FDFBF7',
          accent: '#C5A059',
          darkAccent: '#9A7B38',
          pastel: '#F9E8E8',
          card: '#FFFFFF',
          text: '#4A3E3D',
          border: '#E8DFD8'
        },
        elan: {
          bg: '#FAFAF9',
          accent: '#18181B',
          highlight: '#C25E00',
          sand: '#F4F1EA',
          card: '#FFFFFF',
          text: '#09090B',
          border: '#E4E4E7'
        },
        stryde: {
          bg: '#0F172A',
          cardBg: '#1E293B',
          accent: '#06B6D4',
          highlight: '#F59E0B',
          lightBg: '#F8FAFC',
          text: '#F8FAFC',
          darkText: '#0F172A',
          border: '#334155'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Montserrat', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(212, 175, 55, 0.25)',
        'cyan-glow': '0 0 20px rgba(6, 182, 212, 0.3)',
      }
    },
  },
  plugins: [],
}
