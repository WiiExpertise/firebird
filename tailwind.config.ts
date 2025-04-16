import type { Config } from "tailwindcss";
// Test for prod 3

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        'miko-pink': {
          // 5 Shades for Sentiment Gradient (Lightest to Darkest)
          '100': '#F8E4E8',
          '300': '#F0D4DB',
          '500': '#E8C5CB',
          '700': '#D8AAB4',
          '900': '#C89AA4',

          light: '#F0D4DB',   // lighter shade
          DEFAULT: '#E8C5CB', // Main color 
          dark: '#D8AAB4'    // Darker shade for hover/accents
        },

      },
    },
  },
  plugins: [],
} satisfies Config;
