// markdoc.config.mjs
import { defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    affiliatelink: {
      render: 'AffiliateLink',
      attributes: {
        url: { type: String, required: true },
        label: { type: String },
      },
    },
  },
});
