<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/lib/toast'
import { MessageSquare } from '@/lib/icons'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const organizationId = computed(() => (route.query.org as string) || '')

const handleRegister = async () => {
  if (!organizationId.value) {
    toast.error(t('auth.invitationRequired'))
    return
  }

  if (!fullName.value || !email.value || !password.value) {
    toast.error(t('auth.fillAllFields'))
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.error(t('auth.passwordsMismatch'))
    return
  }

  if (password.value.length < 8) {
    toast.error(t('auth.passwordTooShort'))
    return
  }

  isLoading.value = true

  try {
    await authStore.register({
      full_name: fullName.value,
      email: email.value,
      password: password.value,
      organization_id: organizationId.value
    })
    toast.success(t('auth.registrationSuccess'))
    router.push('/')
  } catch (error: any) {
    const message = error.response?.data?.message || t('auth.registrationFailed')
    toast.error(message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="auth-split">
    <aside class="auth-showcase" aria-hidden="true">
      <div class="hstack items-center gap-3">
        <span class="showcase-logo-mark">
          <MessageSquare :size="18" />
        </span>
        <strong style="font-size: 1rem; letter-spacing: -0.01em;">Whatomate</strong>
      </div>

      <div class="vstack gap-4" style="max-width: 28rem;">
        <h1 style="margin: 0; font-size: 1.75rem; line-height: 1.2; font-weight: 600; color: #f1f3f1;">
          {{ $t('auth.createAccount') }}
        </h1>
        <p style="margin: 0; font-size: 0.9375rem; line-height: 1.5; color: #9aa8a1;">
          {{ $t('auth.createAccountDesc') }}
        </p>
      </div>
    </aside>

    <section class="auth-form-pane">
      <div class="auth-panel">
        <article class="card">
          <header class="vstack gap-2 items-center align-center mb-6">
            <span data-page-icon style="width: 2.5rem; height: 2.5rem;">
              <MessageSquare :size="20" />
            </span>
            <h2>{{ $t('auth.createAccount') }}</h2>
            <p class="text-light">{{ $t('auth.createAccountDesc') }}</p>
          </header>

          <!-- No org ID in URL — show invitation required message -->
          <template v-if="!organizationId">
            <p class="text-light align-center">{{ $t('auth.invitationRequired') }}</p>
            <footer>
              <RouterLink to="/login" class="button outline w-100">{{ $t('auth.signIn') }}</RouterLink>
            </footer>
          </template>

          <!-- Has org ID — show registration form -->
          <form v-else @submit.prevent="handleRegister">
            <label data-field>
              {{ $t('auth.fullName') }}
              <input
                id="fullName"
                v-model="fullName"
                type="text"
                :placeholder="$t('auth.fullNamePlaceholder')"
                :disabled="isLoading"
                autocomplete="name"
              />
            </label>
            <label data-field>
              {{ $t('common.email') }}
              <input
                id="email"
                v-model="email"
                type="email"
                :placeholder="$t('auth.emailPlaceholder')"
                :disabled="isLoading"
                autocomplete="email"
              />
            </label>
            <label data-field>
              {{ $t('auth.password') }}
              <input
                id="password"
                v-model="password"
                type="password"
                :placeholder="$t('auth.passwordMinLength')"
                :disabled="isLoading"
                autocomplete="new-password"
              />
            </label>
            <label data-field>
              {{ $t('auth.confirmPassword') }}
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                :placeholder="$t('auth.confirmPasswordPlaceholder')"
                :disabled="isLoading"
                autocomplete="new-password"
              />
            </label>
            <button type="submit" class="w-100" :disabled="isLoading" :aria-busy="isLoading">
              {{ $t('auth.createAccountBtn') }}
            </button>
            <p class="text-light align-center mt-4">
              {{ $t('auth.alreadyHaveAccount') }}
              <RouterLink to="/login">{{ $t('auth.signIn') }}</RouterLink>
            </p>
          </form>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.showcase-logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-medium);
  background-color: #10b981;
  color: #ffffff;
}
</style>
