import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    CtaButton: {
      // JANGAN pakai import manual di atas, tapi pakai fungsi component() di sini
      render: component('./src/components/AffiliateLink.astro'), 
      attributes: {
        url: { type: String, required: true },
        label: { type: String },
      },
    },
  },
});