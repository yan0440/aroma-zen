/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 將這裡改成 'fttf'，對應你的 App.jsx
        'fttf': ['LXGWWenKai', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}