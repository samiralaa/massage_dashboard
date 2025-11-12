import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/log',
    name: 'Log',
    component: () => import('../views/Dashboard/Log.vue')
  },
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Dashboard/Login.vue')
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('../views/Dashboard/Customers.vue'),

    meta: { requiresAuth: true }
  },
  {
    path: '/brands',
    name: 'Brands',
    component: () => import('../views/Dashboard/Brands.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Dashboard/Orders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/Dashboard/Categories/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/create',
    name: 'CategoryCreate',
    component: () => import('../views/Dashboard/Categories/create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/edit/:id',
    name: 'CategoryEdit',
    component: () => import('../views/Dashboard/Categories/edit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/Dashboard/Products/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products/:id',
    name: 'ProductShow',
    component: () => import('../views/Dashboard/Products/show.vue'),
  },
  {
    path: '/products/create',
    name: 'ProductCreate',
    component: () => import('../views/Dashboard/Products/create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products/:id/edit',
    name: 'ProductEdit',
    component: () => import('../views/Dashboard/Products/Edit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Dashboard/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Dashboard/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/currencies',
    name: 'Currencies',
    component: () => import('../views/Dashboard/inputs/currencies/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/currencies/create',
    name: 'CustomersCreate',
    component: () => import('../views/Dashboard/inputs/currencies/create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/currencies/edit/:id',
    name: 'currencies.edit',
    component: () => import('../views/Dashboard/inputs/currencies/Edit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/units',
    name: 'UnitsList',
    component: () => import('../views/Dashboard/Units/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/units/create',
    name: 'UnitCreate',
    component: () => import('../views/Dashboard/Units/CreateUnit.vue'),
    meta: { requiresAuth: true }
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const tokenData = JSON.parse(localStorage.getItem('tokenData'))
  // and type admin
  const isAdmin = tokenData?.user?.role === 'admin'

  if (to.meta.requiresAuth && !tokenData?.token) {
    next('/')
  } else {
    next()
  }
})

export default router