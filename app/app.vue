<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const colorMode = useColorMode();
const description =
  'Browse two million Goodreads books with Nuxt 4 ISR, extracted payloads, and smart route prefetching.';
const themeColor = computed(() => (colorMode.value === 'dark' ? '#121212' : '#fafafa'));

useHead({
  bodyAttrs: {
    class: 'bg-surface dark:bg-surface-dark text-black antialiased dark:text-white',
  },
  htmlAttrs: { lang: 'en' },
  link: [{ href: '/logo.svg', rel: 'icon', type: 'image/svg+xml' }],
  meta: [
    { content: themeColor, name: 'theme-color' },
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
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <OfflineIndicator />
    <AppToaster />
  </div>
</template>
