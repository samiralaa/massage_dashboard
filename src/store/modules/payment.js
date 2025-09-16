import axios from 'axios'
import { API_URL } from '../index'

export default {
  namespaced: true,

  state: {
    loading: false,
    error: null,
    paymentIntent: null
  },

  mutations: {
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_PAYMENT_INTENT(state, paymentIntent) {
      state.paymentIntent = paymentIntent
    }
  },

  actions: {
    async createOrder({ commit }, { cartItems, shippingDetails, paymentMethod, total, currency }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (!tokenData?.token) {
          throw new Error('Authentication required')
        }

        // Create order with payment intent
        const response = await axios.post(`${API_URL}/api/orders`, {
          items: cartItems,
          shipping: shippingDetails,
          payment_method: paymentMethod,
          total_amount: total,
          currency: currency
        }, {
          headers: {
            Authorization: `Bearer ${tokenData.token}`
          }
        })

        const { order, payment_intent } = response.data
        commit('SET_PAYMENT_INTENT', payment_intent)
        
        // Update orders store
        commit('orders/SET_ORDERS', [...state.orders, order], { root: true })
        
        return { order, payment_intent }
      } catch (error) {
        console.error('Error creating order:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create order'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async confirmPayment({ commit }, { paymentMethodId, paymentIntentId }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const tokenData = JSON.parse(localStorage.getItem('tokenData'))
        if (!tokenData?.token) {
          throw new Error('Authentication required')
        }

        const response = await axios.post(`${API_URL}/api/orders/confirm-payment`, {
          payment_method_id: paymentMethodId,
          payment_intent_id: paymentIntentId
        }, {
          headers: {
            Authorization: `Bearer ${tokenData.token}`
          }
        })

        return response.data
      } catch (error) {
        console.error('Error confirming payment:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to confirm payment'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },

  getters: {
    isLoading: state => state.loading,
    getError: state => state.error,
    getPaymentIntent: state => state.paymentIntent
  }
}