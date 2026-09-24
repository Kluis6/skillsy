/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 already adds vendor prefixes (no autoprefixer needed).
    '@tailwindcss/postcss': {},
  },
};

export default config;
