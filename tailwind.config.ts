import type { Config } from "tailwindcss";

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
          light: '#F0D4DB',   // lighter shade
          DEFAULT: '#E8C5CB', // Main color 
          dark: '#D8AAB4'    // Darker shade for hover/accents
        },

      },
    },
  },
  plugins: [],
} satisfies Config;
