import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
const production=process.env.CSF_DEPLOY==='production';
export default defineConfig({site:'https://customsignforge.com',output:'server',outDir:production?'./dist-production':process.env.CSF_QA==='true'?'./dist-qa':'./dist',session:false,adapter:cloudflare({imageService:'compile',...(production?{configPath:'deployment/wrangler.jsonc'}:{})}),integrations:[react()],devToolbar:{enabled:false}});
