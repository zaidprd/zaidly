// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}', // Penting untuk memindai semua file
    ],
    theme: {
        extend: {
            colors: {
                // Tema Warna Kopi
                'coffee-dark': '#3C2F2F', 
                'coffee-brown': '#6F4E37',
                'coffee-light': '#F5F5DC', 
                'accent-primary': '#B5651D', 
                'link-blue': '#1A73E8', 
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
};