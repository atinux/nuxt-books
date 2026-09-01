<script setup lang="ts">
const route = useRoute();
const mobileSidebarOpen = ref(false);

watch(
  () => route.fullPath,
  () => {
    mobileSidebarOpen.value = false;
  },
);
</script>

<template>
  <div class="group flex min-h-dvh">
    <aside
      class="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r px-5 py-5 md:flex"
    >
      <AppSidebarContent id-prefix="desktop" />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="border-divider bg-surface/80 dark:border-divider-dark dark:bg-surface-dark/80 sticky top-0 z-20 flex items-center gap-2 border-b px-4 py-3 backdrop-blur-md backdrop-saturate-150 sm:gap-3 sm:px-6"
      >
        <button
          aria-label="Open filters"
          class="text-muted hover:bg-card focus-visible:ring-action/40 dark:hover:bg-card-dark inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none md:hidden dark:hover:text-white"
          type="button"
          @click="mobileSidebarOpen = true"
        >
          <AppIcon name="sliders-horizontal" class="size-4" />
        </button>
        <BookSearch />
      </header>

      <main class="flex min-w-0 flex-1 flex-col">
        <slot />
      </main>
    </div>

    <MobileBookSidebar v-model:open="mobileSidebarOpen">
      <AppSidebarContent id-prefix="mobile" mobile />
    </MobileBookSidebar>
  </div>
</template>
