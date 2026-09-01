<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false });

function close() {
  open.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close();
}

watch(open, value => {
  if (import.meta.client) document.body.style.overflow = value ? 'hidden' : '';
});

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="md:hidden">
      <button
        aria-label="Close filters"
        class="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
        type="button"
        @click="close"
      />
      <aside
        aria-labelledby="mobile-sidebar-heading"
        aria-modal="true"
        class="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] max-w-full touch-pan-y flex-col overflow-x-hidden border-r pt-[max(1rem,env(safe-area-inset-top))] pr-4 pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] shadow-2xl outline-none"
        role="dialog"
      >
        <h2 id="mobile-sidebar-heading" class="sr-only">Book filters</h2>
        <button
          aria-label="Close filters"
          class="text-muted hover:bg-card focus-visible:ring-accent dark:hover:bg-card-dark absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 grid size-9 place-items-center rounded-md hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white"
          type="button"
          @click="close"
        >
          <AppIcon name="x" class="size-5" />
        </button>
        <slot />
      </aside>
    </div>
  </Teleport>
</template>
