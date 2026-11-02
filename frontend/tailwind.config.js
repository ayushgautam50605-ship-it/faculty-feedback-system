/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#EEF1F7",
          100: "#D9E0EC",
          200: "#B3C1D9",
          300: "#7E92B8",
          400: "#4C6291",
          500: "#2F4373",
          600: "#25355C",
          700: "#1B2A4A",
          800: "#141F38",
          900: "#0E1628",
        },
        gold: {
          50: "#FBF4E4",
          100: "#F4E3BC",
          300: "#DDB165",
          500: "#C08A28",
          600: "#A5731F",
          700: "#835A17",
        },
        paper: "#F7F6F2",
        ivory: "#FCFBF8",
        leaf: "#3F7D5C",
        rust: "#B4483B",
      },
      fontFamily: {
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,22,40,0.06), 0 1px 0 rgba(14,22,40,0.04)",
      },
    },
  },
  plugins: [],
}

