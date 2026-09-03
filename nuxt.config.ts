import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  colorMode: {
    classSuffix: '',
    dataValue: 'theme',
    disableTransition: true,
    fallback: 'light',
    preference: 'system',
    storage: 'localStorage',
    storageKey: 'nuxt-color-mode',
  },
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
    '/api/books': {
      isr: {
        expiration: 3600,
        allowQuery: ['language', 'list', 'page', 'pages', 'rating', 'search', 'year'],
        passQuery: true,
      },
    },
    '/api/books/count': {
      isr: {
        expiration: 3600,
        allowQuery: ['language', 'list', 'pages', 'rating', 'search', 'year'],
        passQuery: true,
      },
    },
    '/api/books/**': { isr: true },
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL ?? process.env.POSTGRES_URL,
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
