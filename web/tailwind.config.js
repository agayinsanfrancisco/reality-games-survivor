/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cream/beige background palette
        cream: {
          50: '#FEFDFB',
          100: '#FBF8F3',
          200: '#F5F0E6',
          300: '#EDE5D5',
          400: '#E2D6C1',
          500: '#D4C4A8',
          600: '#C4B08B',
          700: '#A8926B',
          800: '#8A7654',
          900: '#6B5A40',
        },
        // Deep burgundy/red accent
        burgundy: {
          50: '#FDF2F2',
          100: '#FCE7E7',
          200: '#FAD1D1',
          300: '#F5AEAE',
          400: '#EC7D7D',
          500: '#A52A2A',  // Main brand color from mockups
          600: '#8B2323',
          700: '#751D1D',
          800: '#5C1717',
          900: '#4A1414',
          950: '#2D0A0A',
        },
        // Keep jungle for success states
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        // Error/penalty
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
