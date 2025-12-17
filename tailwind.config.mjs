/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tema Warna Kopi Zaidly
        'coffee-dark': '#3C2F2F',      // (Heading, Primary Text, Dark BG)
        'coffee-brown': '#6F4E37',     // (Secondary Text/Body Copy)
        'coffee-light': '#F5F5DC',     // (Card Background, Highlight)
        'cream-latte': '#F5F3EB',      // (Main Section Background)
        'accent-primary': '#B5651D',   // (Link, CTA, Brand Color)
        'link-blue': '#1A73E8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // --- CUSTOM TYPOGRAPHY (UNTUK MARKDOWN) ---
      typography: ({ theme }) => ({
        coffee: {
          css: {
            '--tw-prose-body': theme('colors.coffee-brown'),
            '--tw-prose-headings': theme('colors.coffee-dark'),
            '--tw-prose-links': theme('colors.accent-primary'),
            '--tw-prose-bold': theme('colors.coffee-dark'),
            '--tw-prose-bullets': theme('colors.accent-primary'),
            '--tw-prose-quotes': theme('colors.coffee-dark'),
            '--tw-prose-captions': theme('colors.coffee-brown'),
            '--tw-prose-hr': theme('colors.coffee-dark / 0.1'),
            
            // Pengaturan Keterbacaan (Readability)
            'p': {
              marginBottom: '1.8rem', // Jarak antar paragraf lebih lega (Standar US)
              lineHeight: '1.8',      // Spasi antar baris teks
              fontWeight: '400',
            },
            'h2, h3, h4': {
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '-0.025em',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            },
            'blockquote': {
              borderLeftWidth: '4px',
              borderLeftColor: theme('colors.accent-primary'),
              fontStyle: 'italic',
              fontWeight: '500',
              backgroundColor: '#FFFFFF', // Kotak putih tipis untuk quote
              padding: '1rem 1.5rem',
            },
            'li': {
              marginBottom: '0.5rem',
            },
            'strong': {
              color: theme('colors.coffee-dark'),
            },
            'a': {
              textDecoration: 'none',
              fontWeight: '700',
              borderBottom: `2px solid ${theme('colors.accent-primary')}`,
              '&:hover': {
                backgroundColor: theme('colors.accent-primary'),
                color: '#FFFFFF',
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};