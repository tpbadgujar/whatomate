<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useColorMode, type ColorMode } from '@/composables/useColorMode'
import { navigationSections } from './navigation'
import { Search, Sun, Moon, Monitor, ArrowRight } from '@/lib/icons'
import type { Component } from 'vue'

interface CommandItem {
  id: string
  label: string
  group: string
  icon: Component
  keywords?: string
  action: () => void
}

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { setColorMode } = useColorMode()

const dialogEl = ref<HTMLDialogElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)

const navItems = computed<CommandItem[]>(() => {
  const list: CommandItem[] = []
  for (const section of navigationSections) {
    const groupLabel = section.label ? t(section.label) : t('nav.settings')
    for (const item of section.items) {
      const hasPerm = item.childPermissions
        ? item.childPermissions.some(p => authStore.hasPermission(p, 'read'))
        : !item.permission || authStore.hasPermission(item.permission, 'read')
      if (!hasPerm) continue

      if (item.children?.length) {
        for (const child of item.children) {
          if (child.permission && !authStore.hasPermission(child.permission, 'read')) continue
          list.push({
            id: `nav:${child.path}`,
            label: `${t(item.name)} / ${t(child.name)}`,
            group: groupLabel,
            icon: child.icon,
            keywords: `${t(item.name)} ${t(child.name)} ${child.path}`,
            action: () => router.push(child.path)
          })
        }
      } else {
        list.push({
          id: `nav:${item.path}`,
          label: t(item.name),
          group: groupLabel,
          icon: item.icon,
          keywords: `${t(item.name)} ${item.path}`,
          action: () => router.push(item.path)
        })
      }
    }
  }
  return list
})

const themeItems = computed<CommandItem[]>(() => {
  const themes: Array<{ mode: ColorMode; labelKey: string; icon: Component }> = [
    { mode: 'light', labelKey: 'userMenu.themeLight', icon: Sun },
    { mode: 'dark', labelKey: 'userMenu.themeDark', icon: Moon },
    { mode: 'system', labelKey: 'userMenu.themeSystem', icon: Monitor }
  ]
  return themes.map(th => ({
    id: `theme:${th.mode}`,
    label: `${t('userMenu.colorTheme')}: ${t(th.labelKey)}`,
    group: t('userMenu.colorTheme'),
    icon: th.icon,
    keywords: `theme appearance ${th.mode} ${t(th.labelKey)}`,
    action: () => setColorMode(th.mode)
  }))
})

const filteredItems = computed(() => {
  const all = [...navItems.value, ...themeItems.value]
  const q = query.value.trim().toLowerCase()
  if (!q) return all.slice(0, 14)
  return all.filter(item =>
    item.label.toLowerCase().includes(q) ||
    item.group.toLowerCase().includes(q) ||
    (item.keywords?.toLowerCase().includes(q) ?? false)
  )
})

watch(filteredItems, () => {
  activeIndex.value = 0
})

async function open() {
  query.value = ''
  activeIndex.value = 0
  isOpen.value = true
  dialogEl.value?.showModal()
  await nextTick()
  inputEl.value?.focus()
}

function close() {
  isOpen.value = false
  dialogEl.value?.close()
}

function runItem(item: CommandItem) {
  close()
  item.action()
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (isOpen.value) close()
    else open()
  }
}

function onDialogKeydown(e: KeyboardEvent) {
  const len = filteredItems.value.length
  if (!len) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % len
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + len) % len
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = filteredItems.value[activeIndex.value]
    if (item) runItem(item)
  }
}

function onBackdropClick(e: MouseEvent) {
  if (e.target === dialogEl.value) close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

defineExpose({ open, close })
</script>

<template>
  <dialog
    ref="dialogEl"
    class="cmd-dialog"
    :aria-label="t('common.search')"
    @close="isOpen = false"
    @click="onBackdropClick"
    @keydown="onDialogKeydown"
  >
    <div class="cmd-shell">
      <div class="cmd-input-row hstack items-center gap-2">
        <Search :size="16" class="text-light shrink-0" aria-hidden="true" />
        <input
          ref="inputEl"
          v-model="query"
          type="search"
          class="cmd-input"
          :placeholder="`${t('common.search')}...`"
          autocomplete="off"
        />
        <kbd class="kbd-chip">Esc</kbd>
      </div>

      <div class="cmd-results scroll-y" role="listbox">
        <p v-if="filteredItems.length === 0" class="cmd-empty text-light">
          {{ t('common.noResults', 'No matching commands') }}
        </p>
        <button
          v-for="(item, idx) in filteredItems"
          :key="item.id"
          type="button"
          role="option"
          class="cmd-item hstack items-center justify-between gap-3"
          :aria-selected="idx === activeIndex"
          @mouseenter="activeIndex = idx"
          @click="runItem(item)"
        >
          <span class="hstack items-center gap-2 min-w-0">
            <component :is="item.icon" :size="15" class="shrink-0" aria-hidden="true" />
            <span class="truncate">{{ item.label }}</span>
          </span>
          <span class="hstack items-center gap-2 shrink-0">
            <small class="text-light">{{ item.group }}</small>
            <ArrowRight v-if="idx === activeIndex" :size="13" aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.cmd-dialog {
  width: min(100% - 2rem, 34rem);
  padding: 0;
  margin-top: 12vh;
  margin-inline: auto;
  overflow: hidden;
}
.cmd-shell {
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}
.cmd-input-row {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}
.cmd-input {
  flex: 1;
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  height: 2rem !important;
  padding: 0 !important;
  font-size: 0.9375rem;
  color: var(--foreground);
}
.cmd-input:focus {
  outline: none;
}
.cmd-results {
  max-height: 20rem;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.cmd-item {
  width: 100%;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  min-height: 2.25rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-medium);
  color: var(--foreground);
  font-weight: 450;
  text-align: start;
}
.cmd-item[aria-selected="true"] {
  background-color: var(--secondary);
  border-color: var(--border);
  color: var(--primary);
}
.cmd-empty {
  padding: 2rem 1rem;
  text-align: center;
  margin: 0;
  font-size: 0.875rem;
}
</style>
