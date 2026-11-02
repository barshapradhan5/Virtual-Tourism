/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#0A0F0D',
        surface: '#111A16',
        forest: { 
          300: '#52A77A',
          400: '#3E8E64', 
          600: '#1F5C3F',
          800: '#133B28'
        },
        sage: { 
          200: '#B0D4BE',
          300: '#8FBF9F', 
          400: '#75A985' 
        },
        royal: { 
          300: '#A78BFA',
          400: '#8C6BC8', 
          600: '#5B3A8C',
          800: '#3C245D'
        },
        wine: { 
          300: '#C25470',
          400: '#A63A55', 
          600: '#7A1F36',
          800: '#521424'
        },
        ink: { 
          main: '#EDEDE6', 
          muted: '#A8B3AB' 
        },
      },
      backgroundImage: {
        'dusk': 'linear-gradient(160deg, #0A0F0D 0%, #1F5C3F 55%, #5B3A8C 100%)',
        'ember': 'linear-gradient(135deg, #5B3A8C 0%, #7A1F36 100%)',
        'glass-radial': 'radial-gradient(circle at 50% 0%, rgba(31, 92, 63, 0.25) 0%, rgba(10, 15, 13, 0) 70%)',
      },
      boxShadow: {
        glow: '0 0 24px rgba(140, 107, 200, 0.35)',
        'glow-wine': '0 0 24px rgba(122, 31, 54, 0.45)',
        'glow-forest': '0 0 24px rgba(31, 92, 63, 0.4)',
      },
      backdropBlur: { 
        glass: '16px' 
      },
    },
  },
  plugins: [],
}

