/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'handwriting': ['"Caveat"', 'cursive'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        'paper': '#FFFEF9',
        'ink': '#2D3748',
        'sketch': '#4A5568',
      },
    },
  },
  plugins: [],
}
