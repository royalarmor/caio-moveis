/** @type {import('tailwindcss').Config} */

import defaultTheme from 'tailwindcss/defaultTheme';
import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {  
        'xxs': {'max': '639px', "min": "0px"},
        'xxl': {'min': '2000px', 'max': '3000px'},
        '3xl': {'min': '3001px'},
        ...defaultTheme.screens,
      },
    },
  },
  plugins: [daisyui],
}
