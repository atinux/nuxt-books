<script setup lang="ts">
import { toast } from 'vue-sonner';
import AppIcon from './AppIcon.vue';

let toastId: number | string | undefined;

function updateStatus() {
  if (!navigator.onLine && toastId === undefined) {
    toastId = toast.error("You're offline — reconnecting…", {
      duration: Number.POSITIVE_INFINITY,
      icon: h(AppIcon, { class: 'size-4', name: 'wifi-off' }),
    });
  } else if (navigator.onLine && toastId !== undefined) {
    toast.dismiss(toastId);
    toastId = undefined;
  }
}

onMounted(() => {
  updateStatus();
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
});

onBeforeUnmount(() => {
  window.removeEventListener('online', updateStatus);
  window.removeEventListener('offline', updateStatus);
});
</script>

<template>
  <span class="hidden" />
</template>
