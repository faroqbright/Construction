import { purple } from '@mui/material/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true, // Centers the container
      padding: {
        DEFAULT: '1rem', // Default padding for all screens
        sm: '1.5rem',    // Extra padding on small screens
        xs: '1rem',      // Precise padding for extra-small screens
      },
      
       // Adds margin to the container
      screens: {
        sm: '100%',   // Full width on small screens
        md: '640px',  // 640px on medium screens
        lg: '768px',  // 768px on large screens
        xl: '1024px', // 1024px on extra-large screens
        '2xl': '1280px', // 1280px on 2xl screens
      },
    },
    extend: {
      colors:{
        lightpurple:{
                      light:"#54577A",
        },
        red:{
          redNew:"#B91724"
        },
        gray:{
          grayLight:"#A1AEBE"
        },
     
      black:{
        blacknew:"#1A1A18"
      },
      green:{
        greenNew:"#0ECB0A"
      },
      yellow:{
       yellowNew:"#FBBA06"
      }
      },
      backgroundColor: {
        gray:{
          grayLight:"#BDBDBD"
        }
      },
      fontFamily: {
        raleway: ['"Raleway"', 'sans-serif'], // Add Raleway with a fallback
      },
    },
  },
  plugins: [],
}