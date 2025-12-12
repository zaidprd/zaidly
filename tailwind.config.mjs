// tailwind.config.mjs

/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Tema Warna Kopi Anda
                'coffee-dark': '#3C2F2F',      // (Heading, Primary Text, Dark BG)
                'coffee-brown': '#6F4E37',     // (Secondary Text/Body Copy)
                'coffee-light': '#F5F5DC',     // (Card Background, Highlight)
                
                // --- Tambahkan Warna Background yang Lebih Netral Hangat ---
                'cream-latte': '#F5F3EB',      // (Section Background BG)
                
                'accent-primary': '#B5651D',   // (Link, CTA, Hover State)
                'link-blue': '#1A73E8',        // (Jaga untuk link eksternal jika perlu)
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};