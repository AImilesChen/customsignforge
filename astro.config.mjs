import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
export default defineConfig({site:'https://customsignforge.com',output:'server',adapter:cloudflare({imageService:'compile'}),integrations:[react()],devToolbar:{enabled:false}});
