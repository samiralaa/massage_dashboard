import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Categories from '../views/Categories/index.vue'
import Settings from '../views/Settings.vue'
import Profile from '../views/Profile.vue'
import Help from '../views/Help.vue'
import BrandDetail from '@/views/BrandDetail.vue'
import CategoryDetail from '@/views/CategoryDetail.vue'

const routes = [
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Website/Checkout.vue'),
  },
  {
    path: '/otp',
    name: 'Otp',
    component: () => import('@/views/Otp.vue')
  },
  {
    path: '/Account/Login',
    name: 'Account/Login',
    component: () => import('../views/Website/AccountLogin.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/Website/ForgotPassword.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Website/home.vue')
  },
  {
    path: '/read/products/:id',
    name: 'ProductShowHomePage',
    component: () => import('../views/Website/showProduct.vue')
  },

  {
    path: '/about',
    name: 'About',
    component: () => import('../views/Website/About.vue'),
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../views/Website/ContactUs.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  // log
  {
    path: '/log',
    name: 'Log',
    component: () => import('../views/Log.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('../views/Customers.vue'),

    meta: { requiresAuth: true }
  },


  {
    path: '/brands',
    name: 'Brands',
    component: () => import('../views/Brands.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/Categories/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/:id',
    name: 'CategoryShow',
    component: () => import('../views/Categories/show.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/create',
    name: 'CategoryCreate',
    component: () => import('../views/Categories/create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/edit/:id',
    name: 'CategoryEdit',
    component: () => import('../views/Categories/edit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/Products/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products/:id',
    name: 'ProductShow',
    component: () => import('../views/Products/show.vue'),
  },
  {
    path: '/products/create',
    name: 'ProductCreate',
    component: () => import('../views/Products/create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products/:id/edit',
    name: 'ProductEdit',
    component: () => import('../views/Products/Edit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Orders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/user',
    name: 'OrdersUser',
    component: () => import('../views/Website/Order.vue'),
  },


  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Dashboard/Settings.vue'),
    meta: { requiresAuth: true }
  },
  //
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
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),

  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPassword.vue'),

  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../views/Help.vue'),
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
  {
    path: '/product-listing',
    name: 'ProductListing',
    component: () => import('../views/Website/ProductListing.vue')
  },
  {
    path: '/test-payment',
    name: 'TestPayment',
    component: () => import('../views/TestPayment.vue')
  },
  {
    path: '/brand/:id',
    name: 'BrandDetail',
    component: BrandDetail
  },
  {
    path: '/category/:id',
    name: 'CategoryDetail',
    component: CategoryDetail
  },
  {
    path: '/verify-otp',
    name: 'VerifyOtp',
    component: () => import('../views/Website/VerifyOtp.vue')
  },
  {
    path: '/Refund-policy',
    name: 'Refund-policy',
    component: () => import('../views/Website/RefundPolicy.vue'),
    
  },
  {
    path: '/terms-service',
    name: 'TermsService',
    component: () => import('../views/Website/TermsOfService.vue'),
    
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('../views/Website/PrivacyPolicy.vue'),
    
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
    next('/login')
  } else {
    next()
  }
})

export default router