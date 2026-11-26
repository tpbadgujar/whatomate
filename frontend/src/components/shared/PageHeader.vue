<script setup lang="ts">
import { ArrowLeft } from '@/lib/icons'
import type { Component } from 'vue'

defineProps<{
  title: string
  description?: string
  icon?: Component
  // Kept for call-site compatibility; every page uses the classic emerald icon tile.
  iconGradient?: string
  backLink?: string
  // Kept for call-site compatibility; breadcrumbs are intentionally not shown (the sidebar shows location).
  breadcrumbs?: Array<{ label: string; href?: string }>
}>()
</script>

<template>
  <header class="hstack items-end justify-between gap-4 flex-wrap" data-page-header>
    <div class="hstack items-center gap-3 flex-1 min-w-0">
      <RouterLink v-if="backLink" :to="backLink" class="button ghost icon small" :title="$t('common.back', 'Back')" :aria-label="$t('common.back', 'Back')">
        <ArrowLeft :size="16" />
      </RouterLink>
      <div class="min-w-0">
        <p v-if="description" class="truncate" data-page-description>{{ description }}</p>
        <h1 class="truncate">{{ title }}</h1>
      </div>
    </div>
    <div v-if="$slots.actions" class="hstack items-center" data-page-actions>
      <slot name="actions" />
    </div>
  </header>
</template>
