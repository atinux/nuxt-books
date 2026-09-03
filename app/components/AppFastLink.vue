<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

defineOptions({ inheritAttrs: false });

defineProps<{
  prefetchOn?: 'visibility' | 'interaction' | Partial<{ interaction: boolean; visibility: boolean }>;
  to: RouteLocationRaw;
}>();

const emit = defineEmits<{ pressNavigate: [] }>();
let navigatedOnMouseDown = false;
let triggeringClick = false;
let resetTimer: ReturnType<typeof setTimeout> | undefined;

function shouldNavigate(event: MouseEvent) {
  const anchor = event.currentTarget as HTMLAnchorElement;
  const target = event.target instanceof Element ? event.target : undefined;
  const interactiveTarget = target?.closest(
    'button, input, select, textarea, [contenteditable="true"], [role="button"]',
  );

  return (
    !interactiveTarget &&
    (!anchor.target || anchor.target === '_self') &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !anchor.hasAttribute('download') &&
    event.button === 0
  );
}

function handleMouseDown(event: MouseEvent) {
  if (!shouldNavigate(event)) return;

  triggeringClick = true;
  try {
    emit('pressNavigate');
    (event.currentTarget as HTMLAnchorElement).click();
  } finally {
    triggeringClick = false;
  }
  navigatedOnMouseDown = true;
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => (navigatedOnMouseDown = false), 500);
  event.preventDefault();
}

function handleClick(event: MouseEvent) {
  if (triggeringClick || !navigatedOnMouseDown) return;

  clearTimeout(resetTimer);
  navigatedOnMouseDown = false;
  event.preventDefault();
  event.stopImmediatePropagation();
}

onBeforeUnmount(() => clearTimeout(resetTimer));
</script>

<template>
  <NuxtLink
    v-bind="$attrs"
    :prefetch-on="prefetchOn"
    :to="to"
    @click.capture="handleClick"
    @mousedown="handleMouseDown"
  >
    <slot />
  </NuxtLink>
</template>
