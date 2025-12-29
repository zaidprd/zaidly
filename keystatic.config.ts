import { config, fields, collection } from '@keystatic/core';

function toSlug(str: string) {
  if (!str) return '';
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')
  return str.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(p, c => b.charAt(a.indexOf(c)))
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export default config({
  // Paksa ke mode local untuk testing di laptop [cite: 2025-12-30]
  storage: process.env.NODE_ENV === 'development' 
    ? { kind: 'local' } 
    : { kind: 'cloud' },

  cloud: { project: 'zaidly/zaidly' },

  collections: {
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*/', // Memastikan konten masuk ke subfolder [cite: 2025-12-14]
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { length: { min: 4 } } } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Publish Date', validation: { isRequired: true } }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Gear Lab', value: 'gear-lab' },
            { label: 'Bean Roastery', value: 'bean-roastery' },
            { label: 'Brew Mastery', value: 'brew-mastery' },
            { label: 'Barista Life', value: 'barista-life' },
            { label: 'Buying Guides', value: 'buying-guides' },
          ],
          defaultValue: 'gear-lab',
        }),
        author: fields.select({
          label: 'Author',
          options: [{ label: 'Admin', value: 'admin' }],
          defaultValue: 'admin',
        }),
        image: fields.image({
          label: 'Featured Image',
          directory: 'src/assets/images/blog',
          publicPath: '../../../assets/images/blog/', // Jalur relatif yang benar untuk Astro [cite: 2025-12-14]
          transformFilename: (originalFilename: string) => {
            const ext = originalFilename.split('.').pop() || 'jpg';
            const name = originalFilename.replace(`.${ext}`, '');
            return `${toSlug(name)}.${ext}`;
          }
        }),
        tags: fields.array(fields.text({ label: 'Tag' })),
        content: fields.markdoc({
          label: 'Content',
          options: {
            image: {
              directory: 'src/assets/images/blog',
              publicPath: '../../../assets/images/blog/',
              transformFilename: (originalFilename: string) => {
                const ext = originalFilename.split('.').pop() || 'jpg';
                const name = originalFilename.replace(`.${ext}`, '');
                return `${toSlug(name)}.${ext}`;
              }
            },
          },
        }),
      },
    }),
  },
});