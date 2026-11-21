import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rhythm: {
          50: '#f0f9ff',
          900: '#0c2d4a',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
