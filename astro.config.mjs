import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://keiba-computer-web.netlify.app/',
  output: 'server',
  adapter: netlify(),
  server: {
    port: 4323
  }
});
