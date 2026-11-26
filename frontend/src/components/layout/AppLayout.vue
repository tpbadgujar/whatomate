<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useColorMode } from '@/composables/useColorMode'
import { MessageSquare, Menu, Search, ChevronsLeft, ChevronsRight, Sun, Moon } from '@/lib/icons'
import { wsService } from '@/services/websocket'
import { authService } from '@/services/api'
import OrganizationSwitcher from './OrganizationSwitcher.vue'
import UserMenu from './UserMenu.vue'
import CommandPalette from './CommandPalette.vue'
import ActiveCallPanel from '@/components/calling/ActiveCallPanel.vue'
import { ScrollToTop } from '@/components/shared'
import { navigationSections, type NavSection } from './navigation'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isDark, setColorMode } = useColorMode()
const commandPalette = ref<InstanceType<typeof CommandPalette> | null>(null)
const mobileNavOpen = ref(false)
const isCollapsed = ref(false)

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.refreshUserData()

    wsService.connect(async () => {
      try {
        const resp = await authService.getWSToken()
        return resp.data.data.token
      } catch {
        return null
      }
    })
  }
})

function filterItems(items: NavSection['items']) {
  return items
    .filter(item => {
      if (item.childPermissions) {
        return item.childPermissions.some(p => authStore.hasPermission(p, 'read'))
      }
      return !item.permission || authStore.hasPermission(item.permission, 'read')
    })
    .map(item => {
      const filteredChildren = item.children?.filter(
        child => !child.permission || authStore.hasPermission(child.permission, 'read')
      )

      let effectivePath = item.path
      if (item.childPermissions && item.permission && !authStore.hasPermission(item.permission, 'read') && filteredChildren?.length) {
        effectivePath = filteredChildren[0].path
      }

      const originalPath = item.path
      const isActive = originalPath === '/'
        ? route.name === 'dashboard'
        : originalPath === '/chat'
          ? route.name === 'chat' || route.name === 'chat-conversation'
          : route.path.startsWith(originalPath)

      return {
        ...item,
        path: effectivePath,
        active: isActive,
        children: filteredChildren
      }
    })
}

const navSections = computed(() => {
  return navigationSections
    .map(section => ({
      ...section,
      items: filterItems(section.items)
    }))
    .filter(section => section.items.length > 0)
})

const mainSections = computed(() => navSections.value.filter(s => !s.pinBottom))
const bottomSections = computed(() => navSections.value.filter(s => s.pinBottom))

const closeMobileNav = () => {
  mobileNavOpen.value = false
}

const toggleQuickTheme = () => {
  setColorMode(isDark.value ? 'light' : 'dark')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div
    class="saas-shell"
    :data-collapsed="isCollapsed ? 'true' : undefined"
    :data-mobile-nav="mobileNavOpen ? 'open' : undefined"
  >
    <a href="#main-content" class="skip-link">{{ $t('nav.skipToMain') }}</a>

    <!-- Left Sidebar -->
    <aside class="saas-sidebar" :aria-label="t('nav.sidebar')">
      <header class="saas-sidebar-header">
        <div class="hstack items-center gap-2 min-w-0 flex-1">
          <span class="saas-brand-tile" aria-hidden="true">
            <MessageSquare :size="16" />
          </span>
          <div v-if="!isCollapsed" class="min-w-0 flex-1">
            <OrganizationSwitcher />
          </div>
        </div>
        <button
          type="button"
          class="ghost icon small"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="isCollapsed = !isCollapsed"
        >
          <ChevronsRight v-if="isCollapsed" :size="15" aria-hidden="true" />
          <ChevronsLeft v-else :size="15" aria-hidden="true" />
        </button>
      </header>

      <nav class="saas-sidebar-nav" :aria-label="t('nav.mainNavigation')">
        <template v-for="section in mainSections" :key="section.label">
          <div v-if="section.label && !isCollapsed" class="saas-nav-section-label">
            {{ $t(section.label) }}
          </div>
          <ul class="saas-nav-list">
            <li v-for="item in section.items" :key="item.path">
              <RouterLink
                :to="item.path"
                class="saas-nav-link"
                :aria-current="item.active ? 'page' : undefined"
                :title="isCollapsed ? $t(item.name) : undefined"
                @click="closeMobileNav"
              >
                <component :is="item.icon" :size="17" class="shrink-0" aria-hidden="true" />
                <span v-if="!isCollapsed" class="truncate">{{ $t(item.name) }}</span>
              </RouterLink>

              <ul v-if="item.children && item.active && !isCollapsed" class="saas-subnav-list">
                <li v-for="child in item.children" :key="child.path">
                  <RouterLink
                    :to="child.path"
                    :aria-current="route.path === child.path ? 'page' : undefined"
                    @click="closeMobileNav"
                  >
                    <component :is="child.icon" :size="14" class="shrink-0" aria-hidden="true" />
                    <span class="truncate">{{ $t(child.name) }}</span>
                  </RouterLink>
                </li>
              </ul>
            </li>
          </ul>
        </template>

        <template v-if="bottomSections.length > 0">
          <div v-if="!isCollapsed" class="saas-nav-section-label" style="margin-top: 0.75rem;">
            {{ $t('nav.settings') }}
          </div>
          <ul class="saas-nav-list">
            <template v-for="section in bottomSections" :key="section.label">
              <li v-for="item in section.items" :key="item.path">
                <RouterLink
                  :to="item.path"
                  class="saas-nav-link"
                  :aria-current="item.active ? 'page' : undefined"
                  :title="isCollapsed ? $t(item.name) : undefined"
                  @click="closeMobileNav"
                >
                  <component :is="item.icon" :size="17" class="shrink-0" aria-hidden="true" />
                  <span v-if="!isCollapsed" class="truncate">{{ $t(item.name) }}</span>
                </RouterLink>

                <ul v-if="item.children && item.active && !isCollapsed" class="saas-subnav-list">
                  <li v-for="child in item.children" :key="child.path">
                    <RouterLink
                      :to="child.path"
                      :aria-current="route.path === child.path ? 'page' : undefined"
                      @click="closeMobileNav"
                    >
                      <component :is="child.icon" :size="14" class="shrink-0" aria-hidden="true" />
                      <span class="truncate">{{ $t(child.name) }}</span>
                    </RouterLink>
                  </li>
                </ul>
              </li>
            </template>
          </ul>
        </template>
      </nav>
    </aside>

    <!-- Top Header Bar -->
    <header class="saas-topbar">
      <div class="hstack items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          class="ghost icon small saas-mobile-toggle"
          :aria-label="t('nav.toggleMenu')"
          :aria-expanded="mobileNavOpen"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          <Menu :size="16" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="saas-search-bar hstack items-center"
          @click="commandPalette?.open()"
        >
          <Search :size="15" aria-hidden="true" />
          <span class="truncate">{{ $t('common.search') }}...</span>
        </button>
      </div>

      <div class="saas-topbar-right">
        <button
          type="button"
          class="outline icon small"
          :aria-label="$t('userMenu.colorTheme')"
          :title="$t('userMenu.colorTheme')"
          @click="toggleQuickTheme"
        >
          <Sun v-if="isDark" :size="15" aria-hidden="true" />
          <Moon v-else :size="15" aria-hidden="true" />
        </button>
        <UserMenu @logout="handleLogout" />
      </div>
    </header>

    <!-- Main Content -->
    <main id="main-content" class="saas-main">
      <RouterView v-slot="{ Component, route: viewRoute }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="viewRoute.meta.stableKey ? String(viewRoute.name) : viewRoute.path" />
        </Transition>
      </RouterView>
      <ActiveCallPanel />
      <ScrollToTop />
      <CommandPalette ref="commandPalette" />
    </main>
  </div>
</template>
