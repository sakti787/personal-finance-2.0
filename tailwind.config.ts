import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Theme Colors
        'background': '#0a0a0a', // Near Black
        'foreground': '#ffffff', // Pure White
        'muted': '#6b7280', // Dark Gray
        'muted-foreground': '#9ca3af', // Light Gray
        'card': 'rgba(255, 255, 255, 0.03)', // Very subtle glass
        'border': 'rgba(255, 255, 255, 0.08)', // Subtle border
        'primary': {
          DEFAULT: '#9333ea', // Purple-600
          start: '#7c3aed', // Purple-600
          end: '#a855f7', // Purple-500
        },
        'success': '#39FF14', // Neon Green for income
        'danger': '#F472B6', // Soft red/pink for expenses
        'neon-green': '#39FF14', // Neon Green
        'secondary': '#9CA3AF', // Light Gray
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;