<script setup lang="ts">
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Hash,
  LoaderCircle,
  Monitor,
  Moon,
  Search,
  SlidersHorizontal,
  Star,
  Sun,
  WifiOff,
  X,
} from '@lucide/vue';
import type { Component } from 'vue';

defineOptions({ name: 'AppIcon' });

const props = defineProps<{
  name:
    | 'alert-triangle'
    | 'arrow-left'
    | 'book-open'
    | 'building'
    | 'calendar'
    | 'chevron-down'
    | 'chevron-left'
    | 'chevron-right'
    | 'globe'
    | 'hash'
    | 'loader'
    | 'monitor'
    | 'moon'
    | 'search'
    | 'sliders-horizontal'
    | 'star'
    | 'sun'
    | 'wifi-off'
    | 'x';
}>();

const icons: Record<typeof props.name, Component> = {
  'alert-triangle': AlertTriangle,
  'arrow-left': ArrowLeft,
  'book-open': BookOpen,
  building: Building2,
  calendar: CalendarDays,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  globe: Globe,
  hash: Hash,
  loader: LoaderCircle,
  monitor: Monitor,
  moon: Moon,
  search: Search,
  'sliders-horizontal': SlidersHorizontal,
  star: Star,
  sun: Sun,
  'wifi-off': WifiOff,
  x: X,
};
</script>

<template>
  <component :is="icons[props.name]" aria-hidden="true" />
</template>
