import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 5,
  },
  experimental: {
    // Optimizer-backed image hints are normalized to reusable low-priority
    // preloads by app/plugins/prefetch-image-preloads.client.ts.
    prefetchPreloadTags: true,
  },
  image: {
    domains: ['images.gr-assets.com', 's.gr-assets.com'],
    quality: 82,
  },
  modules: ['@nuxt/image', '@nuxtjs/color-mode', '@nuxt/eslint', '@vercel/analytics', '@vercel/speed-insights'],
  nitro: {
    future: {
      nativeSWR: true,
    },
    storage: {
      cache: {
        base: 'nuxt-books:v1',
        driver: process.env.VERCEL ? 'vercel-runtime-cache' : 'memory',
      },
    },
  },
  // Nuxt requires a cache route rule to generate runtime _payload.json routes.
  routeRules: {
    '/**': { cache: { headersOnly: true, maxAge: 3600 } },
    '/api/**': { cache: false },
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
