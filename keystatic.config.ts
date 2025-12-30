import { config, fields, collection } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

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
        // Judul dengan tanda bintang wajib isi
        title: fields.slug({ 
          name: { label: 'Title', validation: { isRequired: true, length: { min: 4 } } } 
        }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Publish Date', validation: { isRequired: true } }),
        
        // 1. FITUR DRAFT: Default centang (True) agar tidak langsung publish
        draft: fields.checkbox({ 
          label: 'Save as Draft', 
          description: 'Jika dicentang, artikel tidak akan muncul di website.',
          defaultValue: true 
        }),

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

        // 2. FEATURED IMAGE: Wajib Isi + Auto-Fix Spasi jadi Strip (-)
        image: fields.image({
          label: 'Featured Image',
          validation: { isRequired: true }, 
          directory: 'src/assets/images/blog',
          publicPath: '../../../assets/images/blog/',
          transformFilename: (originalFilename) => {
            return originalFilename
              .toLowerCase()
              .replace(/\s+/g, '-')      // Ganti spasi jadi strip
              .replace(/[^\w\-.]+/g, ''); // Hapus karakter aneh
          },
        }),

        // 3. TAGS OTOMATIS: Pilih dari daftar kategori
        tags: fields.multiselect({
          label: 'Hashtags / Tags',
          options: [
            { label: '#GearLab', value: 'gear-lab' },
            { label: '#BeanRoastery', value: 'bean-roastery' },
            { label: '#BrewMastery', value: 'brew-mastery' },
            { label: '#BaristaLife', value: 'barista-life' },
            { label: '#BuyingGuides', value: 'buying-guides' },
          ],
          defaultValue: [],
        }),

        content: fields.markdoc({
          label: 'Content',
          options: {
            image: {
              directory: 'src/assets/images/blog',
              publicPath: '../../../assets/images/blog/',
            },
          },
          components: {
  CtaButton: block({ // Ganti ID jadi CtaButton
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
