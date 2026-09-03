<script setup lang="ts">
const colorMode = useColorMode();
const modes = [
  { icon: 'sun' as const, label: 'Light mode', value: 'light' },
  { icon: 'moon' as const, label: 'Dark mode', value: 'dark' },
  { icon: 'monitor' as const, label: 'System theme', value: 'system' },
];
</script>

<template>
  <div aria-label="Color mode" class="inline-flex items-center gap-0.5" role="group">
    <ClientOnly>
      <button
        v-for="mode in modes"
        :key="mode.value"
        :aria-label="mode.label"
        :aria-pressed="colorMode.unknown ? undefined : colorMode.preference === mode.value"
        class="rounded-full p-1.5 transition-colors"
        :class="
          !colorMode.unknown && colorMode.preference === mode.value
            ? 'bg-card dark:bg-card-dark text-black dark:text-white'
            : 'text-muted hover:text-black dark:hover:text-white'
        "
        :disabled="colorMode.unknown || colorMode.forced"
        type="button"
        @click="colorMode.preference = mode.value"
      >
        <AppIcon :name="mode.icon" class="size-4" />
      </button>
      <template #fallback>
        <button
            v-for="mode in modes"
            :key="mode.value"
            :aria-label="mode.label"
            class="rounded-full p-1.5 transition-colors text-muted hover:text-black dark:hover:text-white"
            disabled
            type="button"
        >
            <AppIcon :name="mode.icon" class="size-4" />
        </button>
      </template>
    </ClientOnly>
  </div>
</template>
