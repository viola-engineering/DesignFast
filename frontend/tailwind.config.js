/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F4F0E6',
        ink: '#100E0B',
        'ink-light': '#6B6560',
        accent: '#CC3209',
        'accent-warm': '#E8440F',
        white: '#FDFBF7',
        rule: 'rgba(16,14,11,0.12)',
        dark: '#100E0B'
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Space Grotesk', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
