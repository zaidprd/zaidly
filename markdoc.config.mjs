// markdoc.config.mjs
import { defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    AffiliateButton: {
      render: 'AffiliateLink', // Ini merujuk ke src/components/AffiliateLink.astro
      attributes: {
        url: { type: String, required: true },
        label: { type: String },
      },
    },
  },
});