<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const description =
  'Browse two million Goodreads books with Nuxt 4 ISR, extracted payloads, and smart route prefetching.';

useHead({
  bodyAttrs: {
    class: 'bg-surface dark:bg-surface-dark text-black antialiased dark:text-white',
  },
  htmlAttrs: { lang: 'en' },
  link: [{ href: '/logo.svg', rel: 'icon', type: 'image/svg+xml' }],
  meta: [
    { content: '#fafafa', media: '(prefers-color-scheme: light)', name: 'theme-color' },
    { content: '#121212', media: '(prefers-color-scheme: dark)', name: 'theme-color' },
    { content: 'cover', name: 'viewport-fit' },
  ],
  titleTemplate: title => (title ? `${title} · NuxtBooks` : 'NuxtBooks'),
});

useSeoMeta({
  description,
  ogDescription: description,
  ogSiteName: 'NuxtBooks',
  ogTitle: 'NuxtBooks',
  ogType: 'website',
  ogUrl: runtimeConfig.public.baseUrl,
});
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="var(--color-action)" />
    <NuxtLayout>
      <NuxtPage keepalive />
    </NuxtLayout>
    <OfflineIndicator />
    <AppToaster />
  </div>
</template>
