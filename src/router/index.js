import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // Giriş Sayfası (Kendi başına tam ekran açılır)
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Auth/Login.vue'),
  },
  // Admin Paneli (AppLayout içinde açılır)
  {
    path: '/',
    component: () => import('../layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../pages/Dashboard/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'Kullanıcılar',
        component: () => import('../pages/Users/User.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router