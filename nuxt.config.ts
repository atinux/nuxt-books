import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  experimental: {
    payloadExtraction: 'client',
  },
  future: {
    compatibilityVersion: 5,
  },
  image: {
    domains: ['images.gr-assets.com', 's.gr-assets.com'],
    quality: 82,
  },
  modules: ['@nuxt/image', '@nuxtjs/color-mode', '@nuxt/eslint', '@vercel/analytics', '@vercel/speed-insights'],
  routeRules: {
    '/': { isr: 3600 },
    '/**': { isr: 3600 },
    '/api/**': { isr: false },
  },
  runtimeConfig: {
    postgresUrl: process.env.POSTGRES_URL,
    public: {
      baseUrl:
        process.env.NUXT_PUBLIC_BASE_URL ??
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : 'http://localhost:3000'),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
