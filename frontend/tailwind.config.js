/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#18304F',
        paper: '#F4F6F8',
        surface: '#FFFFFF',
        rule: '#D5DBE3',
        'field-border': '#7D8A9C',
        muted: '#5B6B82',
        highlighter: '#FFE58A',
        status: {
          approved: {
            DEFAULT: '#1E7B4F',
            bg: '#E8F5E9',
          },
          review: {
            DEFAULT: '#9A5B00',
            bg: '#FEF3C7',
          },
          denied: {
            DEFAULT: '#B42318',
            bg: '#FEE4E2',
          },
          siu: {
            DEFAULT: '#5B3FA0',
            bg: '#F4EBFF',
          },
          subro: {
            DEFAULT: '#0E7C7B',
            bg: '#E0F2F1',
          },
          processing: {
            DEFAULT: '#2457C5',
            bg: '#EFF4FE',
          },
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"IBM Plex Serif"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'md': ['18px', '26px'],
        'lg': ['21px', '28px'],
        'xl': ['24px', '32px'],
        '2xl': ['36px', '44px'],
      },
      borderRadius: {
        tag: '4px',
        input: '6px',
        panel: '10px',
      },
      boxShadow: {
        floating: '0 4px 16px -2px rgba(24, 48, 79, 0.08), 0 2px 6px -1px rgba(24, 48, 79, 0.04)',
        drawer: '-4px 0 24px -2px rgba(24, 48, 79, 0.12)',
      },
    },
  },
  plugins: [],
}
