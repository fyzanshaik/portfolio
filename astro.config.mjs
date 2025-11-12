import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://fyzanshaik.in',
  output: 'server',
  adapter: cloudflare({ mode: 'directory' }),

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),

      serialize(item) {
        if (item.url === 'https://fyzanshaik.in/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        }
        if (/\/posts\//.test(item.url)) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        }
        if (/\/blog\/?$/.test(item.url)) {
          item.priority = 0.8;
          item.changefreq = 'daily';
        }
        return item;
      },

      filter: page => {
        return !page.includes('/api/');
      },
    }),
  ],
});
