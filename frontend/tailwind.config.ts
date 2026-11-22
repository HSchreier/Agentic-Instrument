import type { Config } from 'tailwindcss'

const modernist = {
  colors: {
    bg: '#f3f2f2',
    surface: '#eae9e9',
    ink: '#201e1d',
    lcd: '#000000',
    divider: 'rgb(32 30 29 / 0.4)',
    accent: {
      DEFAULT: '#ec3013',
      100: '#fff2ef',
      200: '#ffe0d9',
      300: '#ffc4b8',
      400: '#ff9783',
      500: '#ff563c',
      600: '#dd2b0f',
      700: '#ae1800',
      800: '#7c1405',
      900: '#4d170e',
    },
    neutral: {
      100: '#f8f4f4',
      200: '#eae7e7',
      300: '#d7d3d3',
      400: '#bab6b6',
      500: '#9b9797',
      600: '#7d7979',
      700: '#605d5d',
      800: '#444141',
      900: '#2d2b2b',
    },
  },
  fontFamily: {
    sans: ['Archivo', 'system-ui', 'sans-serif'],
    heading: ['Archivo', 'system-ui', 'sans-serif'],
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
  },
  borderRadius: {
    none: '0',
    DEFAULT: '0',
    sm: '0',
    md: '0',
    lg: '0',
    full: '9999px',
  },
  boxShadow: {
    sm: '0 1px 2px rgb(45 43 43 / 0.14)',
    md: '0 3px 10px rgb(45 43 43 / 0.16)',
    lg: '0 12px 32px rgb(45 43 43 / 0.22)',
  },
  borderWidth: {
    rule: '2px',
  },
  screens: {
    tablet: '768px',
    desktop: '1200px',
  },
  keyframes: {
    'toast-in': {
      from: { transform: 'translateY(-8px)', opacity: '0' },
      to: { transform: 'none', opacity: '1' },
    },
    'dialog-in': {
      from: { transform: 'scale(.97)', opacity: '0' },
      to: { transform: 'none', opacity: '1' },
    },
    'tab-fade': {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
  },
  animation: {
    'toast-in': 'toast-in 200ms ease-out',
    'dialog-in': 'dialog-in 150ms ease-out',
    'tab-fade': 'tab-fade 200ms ease-out',
  },
}

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: modernist,
  },
  plugins: [],
} satisfies Config
