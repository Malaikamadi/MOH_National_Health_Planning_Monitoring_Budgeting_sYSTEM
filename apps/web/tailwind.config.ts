import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // MOHS brand palette — derived from the Sierra Leone coat of arms
        brand: {
          50: '#eef4ff',
          100: '#dae6ff',
          200: '#bdd4ff',
          300: '#90baff',
          400: '#5c95ff',
          500: '#3672f8',
          600: '#1f55db',
          700: '#1a3f6f',
          800: '#163560',
          900: '#0f2847',
          950: '#0a1a30',
        },
        // Sierra Leone green accent
        accent: {
          50: '#edfcf2',
          100: '#d3f8e0',
          200: '#aaf0c6',
          300: '#72e3a5',
          400: '#3bcf7f',
          500: '#1ab563',
          600: '#0e934f',
          700: '#0b7540',
          800: '#0c5d35',
          900: '#0a4d2d',
        },
        // Gold (from coat of arms lions)
        gold: {
          50: '#fdf8ed',
          100: '#f9edce',
          200: '#f2d899',
          300: '#ebc064',
          400: '#e5a83c',
          500: '#dc8e21',
          600: '#c2701a',
          700: '#a15318',
          800: '#84421a',
          900: '#6d3719',
        },
        success: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669', 700: '#047857' },
        warning: { 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
        danger:  { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'sidebar': '2px 0 8px -2px rgb(0 0 0 / 0.06)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0f2847 0%, #1a3f6f 50%, #1f55db 100%)',
        'gradient-accent': 'linear-gradient(135deg, #0b7540 0%, #1ab563 100%)',
        'gradient-gold': 'linear-gradient(135deg, #a15318 0%, #e5a83c 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up': 'countUp 0.8s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
