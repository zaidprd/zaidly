import { config, fields, collection } from '@keystatic/core';
import { block } from '@keystatic/core/content-components'; // ✨ TAMBAHKAN IMPOR INI

// ... fungsi toSlug lu tetap sama ...

export default config({
  storage: process.env.NODE_ENV === 'development' ? { kind: 'local' } : { kind: 'cloud' },
  cloud: { project: 'zaidly/zaidly' },

  collections: {
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*/', 
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
          publicPath: '../../../assets/images/blog/',
        }),
        tags: fields.array(fields.text({ label: 'Tag' })),
        content: fields.markdoc({
          label: 'Content',
          options: {
            image: {
              directory: 'src/assets/images/blog',
              publicPath: '../../../assets/images/blog/',
            },
          },
          components: {
            // ✨ GUNAKAN FUNGSI block() SESUAI DOKUMENTASI
            AffiliateButton: block({
              label: 'Affiliate Button',
              schema: {
                url: fields.url({ label: 'Product Link', validation: { isRequired: true } }),
                label: fields.select({
                  label: 'Platform',
                  options: [
                    { label: 'Amazon', value: 'Amazon' },
                    { label: 'AliExpress', value: 'AliExpress' },
                  ],
                  defaultValue: 'Amazon',
                }),
              },
            }),
          },
        }),
      },
    }),
  },
});
