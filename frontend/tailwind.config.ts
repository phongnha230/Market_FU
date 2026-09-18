import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fpt: {
          DEFAULT: '#F27024',
          orange: '#F27024',
          'orange-light': '#FFF5EE',
          'orange-hover': '#E05D10',
          blue: '#1C3F94',
          'blue-dark': '#0F265C',
          navy: '#0F172A',
        },
      },
    },
  },
  plugins: [],
};
export default config;
