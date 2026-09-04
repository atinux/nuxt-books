function isOptimizedImage(href: unknown): href is string {
  if (typeof href !== 'string') return false;

  const pathname = new URL(href, window.location.origin).pathname;
  return pathname === '/_vercel/image' || pathname.startsWith('/_ipx/');
}

export default defineNuxtPlugin({
  dependsOn: ['nuxt:head'],
  name: 'prefetch-image-preloads',
  setup(nuxtApp) {
    const head = injectHead(nuxtApp);
    if (!head.hooks) throw new Error('Nuxt head hooks are unavailable.');

    head.hooks.hook('entries:normalize', ({ tags }) => {
      for (const tag of tags) {
        if (
          tag.tag !== 'link' ||
          tag.props.rel !== 'prefetch' ||
          tag.props.as !== 'image' ||
          !isOptimizedImage(tag.props.href)
        ) {
          continue;
        }

        // A generic prefetch uses a document Accept header, so Vercel's
        // Vary: Accept response cannot satisfy the later image request.
        tag.props.rel = 'preload';
        tag.props.fetchpriority = 'low';
      }
    });
  },
});
