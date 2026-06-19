import type { Config } from 'tailwindcss';
const { heroui } = require('@heroui/react');

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        cream: '#faf7ea',
        surface: '#f1ecda',
        ink: '#2e251d',
        'ink-soft': '#5c4f42',
        accent: '#8e705b',
        'accent-deep': '#6f5645',
        line: '#ddd5bf',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    heroui({
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            // accent family is reserved for interactive / accent surfaces
            primary: {
              DEFAULT: '#8e705b',
              foreground: '#faf7ea',
            },
            secondary: {
              DEFAULT: '#6f5645',
              foreground: '#faf7ea',
            },
            background: '#faf7ea',
            foreground: '#2e251d', // accessible ink text (AAA on cream)
            focus: '#8e705b',
          },
        },
        dark: {
          layout: {}, // dark theme layout tokens
          colors: {}, // dark theme colors
        },
      },
    }),
  ],
};
export default config;
