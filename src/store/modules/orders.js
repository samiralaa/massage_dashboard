import axios from 'axios'
import { API_URL } from '../index'

export default {
  namespaced: true,

  state: {
    orders: [],
    loading: false,
    error: null,
    selectedOrder: null
  },

  mutations: {
    SET_ORDERS(state, orders) {
      state.orders = orders
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_SELECTED_ORDER(state, order) {
      state.selectedOrder = order
    }
  },

  actions: {
    async fetchOrders({ commit }, { from = null, to = null } = {}) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (!tokenData?.token) {
          throw new Error('Authentication required')
        }

        const params = {}
        if (from) {
          params.from = from
        }
        if (to) {
          params.to = to
        }

        const response = await axios.get(`${API_URL}/api/orders`, {
          params,
          headers: {
            Authorization: `Bearer ${tokenData.token}`
          }
        })

        const orders = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.orders || []

        commit('SET_ORDERS', orders)
        return orders
      } catch (error) {
        console.error('Error fetching orders:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async getOrderDetails({ commit }, orderId) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (!tokenData?.token) {
          throw new Error('Authentication required')
        }

        const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${tokenData.token}`
          }
        })

        const order = response.data.data || response.data
        commit('SET_SELECTED_ORDER', order)
        return order
      } catch (error) {
        console.error('Error fetching order details:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order details'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },

  getters: {
    getOrders: state => state.orders,
    getSelectedOrder: state => state.selectedOrder,
    isLoading: state => state.loading,
    getError: state => state.error,
    getTotalOrders: state => state.orders.length
  }
}