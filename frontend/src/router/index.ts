import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/styles',
      name: 'styles',
      component: () => import('@/views/StylesView.vue')
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('@/views/PricingView.vue')
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/PrivacyView.vue')
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/TermsView.vue')
    },
    {
      path: '/generate',
      name: 'generate',
      component: () => import('@/views/GenerateView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/views/VerifyEmailView.vue'),
      meta: { requiresAuth: true, requiresUnverified: true }
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('@/views/AccountView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/GenerationHistoryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/generation/:id',
      name: 'generation-detail',
      component: () => import('@/views/GenerationDetailView.vue'),
      meta: { requiresAuth: true }
    }
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Auth navigation guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize if not already done
  if (!authStore.initialized) {
    await authStore.fetchUser()
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Redirect logged-in users away from guest-only pages
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'generate' })
    return
  }

  // Hard enforcement: redirect unverified users to verify-email page
  // Allow access to: verify-email, public info pages, and account (for buying credits)
  const publicPages = ['home', 'pricing', 'privacy', 'terms', 'styles', 'login', 'register', 'account']
  if (
    authStore.isAuthenticated &&
    authStore.user &&
    !authStore.user.emailVerified &&
    !to.meta.requiresUnverified &&
    !publicPages.includes(to.name as string)
  ) {
    next({ name: 'verify-email' })
    return
  }

  // Redirect verified users away from verify-email page
  if (to.meta.requiresUnverified && authStore.user?.emailVerified) {
    next({ name: 'generate' })
    return
  }

  next()
})

export default router
