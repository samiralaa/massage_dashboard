import { createStore } from 'vuex'
import axios from 'axios'
import categories from './modules/categories'
import brands from './modules/brands'
import currency from './modules/currency'
import websiteCategories from './modules/websiteCategories'
import orders from './modules/orders'
import payment from './modules/payment'
import countries from './modules/countries'
import users from './modules/users'
import favorites from './modules/favorites'


export const API_URL = 'https://massagebackend.webenia.org';


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Access-Control-Allow-Origin': '*'
  },
  withCredentials: true
})

api.interceptors.request.use(config => {
  const tokenData = JSON.parse(localStorage.getItem('tokenData'))
  if (tokenData?.token) {
    config.headers.Authorization = `Bearer ${tokenData.token}`
  }
  return config
})

export default createStore({
  modules: {
    categories,
    brands,
    currency,
    websiteCategories,
    orders,
    payment,
    countries,
    users,
    favorites
  },
  state: {
    products: [],
    customers: [],
    brands: [],
    salesData: {
      daily: [],
      weekly: [],
      monthly: []
    },
    loading: false,
    error: null,
    token: localStorage.getItem('tokenData') ? JSON.parse(localStorage.getItem('tokenData')).token : null,
    user: null,
    profile: null
  },
  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products
    },

    SET_CUSTOMERS(state, customers) {
      state.customers = customers
    },
    SET_BRANDS(state, brands) {
      state.brands = brands
    },
    SET_SALES_DATA(state, { period, data }) {
      state.salesData[period] = data
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        const tokenData = { token }
        localStorage.setItem('tokenData', JSON.stringify(tokenData))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        localStorage.removeItem('tokenData')
        delete api.defaults.headers.common['Authorization']
      }
    },
    SET_USER(state, user) {
      state.user = user
    },
    SET_PROFILE(state, profile) {
      state.profile = profile
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const response = await api.post('/api/login', {
          email: credentials.email,
          password: credentials.password
        })



        // Check for token structure in response, including nested data object
        const responseData = response.data.data || response.data
        const token = responseData.token || responseData.access_token
        const user = responseData.user || { name: 'Admin' }

        if (token) {
          commit('SET_TOKEN', token)
          commit('SET_USER', user)
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          return response.data
        } else {
          throw new Error('Login failed: No token received')
        }
      } catch (error) {
        console.error('Login error:', error)
        const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
      commit('SET_CUSTOMERS', [])
      commit('SET_PRODUCTS', [])
      commit('SET_ORDERS', [])
    },

    async fetchCustomers({ commit, state }) {
      try {
        if (!state.token) throw new Error('Authentication required')
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (tokenData?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
        }

        const response = await api.get('/api/users')
        const users = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.users || []

        commit('SET_CUSTOMERS', users)
        return users
      } catch (error) {
        console.error('Fetch customers error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch customers'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchBrands({ commit, state }) {
      try {
        if (!state.token) throw new Error('Authentication required')
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (tokenData?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
        }

        const response = await api.get('/api/brands')
        const brands = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.brands || []

        commit('SET_BRANDS', brands)
        return brands
      } catch (error) {
        console.error('Fetch brands error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch brands'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchProducts({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.get('/products')
        commit('SET_PRODUCTS', response.data)
      } catch (error) {
        commit('SET_ERROR', 'Failed to fetch products')
      } finally {
        commit('SET_LOADING', false)
      }
    },



    async registerUser({ commit }, userData) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const response = await api.post('/api/register', {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          password: userData.password,
          password_confirmation: userData.password_confirmation
        })



        if (response.data?.data?.token) {
          commit('SET_TOKEN', response.data.data.token)
          commit('SET_USER', response.data.data.user)
          return response.data
        } else {
          throw new Error('Registration failed: No token received')
        }
      } catch (error) {
        console.error('Registration error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchProfile({ commit, state }) {
      try {
        if (!state.token) throw new Error('Authentication required')

        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (tokenData?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
        }

        const response = await api.get('/api/me')
        commit('SET_PROFILE', response.data)
        return response.data
      } catch (error) {
        console.error('Fetch profile error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch profile'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    totalProducts: state => state.products.length,
    totalCustomers: state => state.customers.length,
    totalBrands: state => state.brands.length,
    getCustomers: state => state.customers,
    getBrands: state => state.brands,
    isLoading: state => state.loading,
    getError: state => state.error,
    isAuthenticated: state => !!state.token,
    getUser: state => state.user,
    getProfile: state => state.profile
  }
})
