import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7fa',
          100: '#d9ecf3',
          200: '#b7dbe9',
          300: '#86c2da',
          400: '#4fa3c5',
          500: '#2b84a9',
          600: '#1b678a',
          700: '#15516e',
          800: '#114157',
          900: '#0c3547',
          950: '#07212e',
          sapphire: '#0F4C64',
          'sapphire-dark': '#093344',
          'sapphire-light': '#186483',
          rosegold: '#CFA276',
          'rosegold-light': '#DFC1A1',
          'rosegold-dark': '#B58759',
          gold: '#CFA276', // maintain backward compatibility
          obsidian: '#0A0E14',
          'obsidian-card': '#101620',
          'obsidian-border': '#1B2432',
          silk: '#F8FAFC',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
