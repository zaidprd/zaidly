import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    // Gunakan nama CtaButton agar sinkron dengan Keystatic
    CtaButton: {
      render: component('./src/components/AffiliateLink.astro'), 
      attributes: {
        url: { type: String, required: true },
        label: { type: String },
      },
    },
  },
});