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
        // Oxford Blue - Main background
        'background': '#14213d',
        // Black - Card/Container background
        'card': '#000000',
        // Orange (Web) - Primary/Accent
        'primary': '#fca311',
        'primary-foreground': '#ffffff',
        // Platinum - Foreground text
        'foreground': '#e5e5e5',
        // White - Subtle text
        'muted': '#ffffff',
        'muted-foreground': '#ffffff',
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