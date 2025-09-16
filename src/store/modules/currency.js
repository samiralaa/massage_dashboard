export default {
  state: {
    currency: localStorage.getItem('currency') || 'AED'
  },
  mutations: {
    setCurrency(state, currency) {
      state.currency = currency
    }
  },
  getters: {
    currentCurrency: state => state.currency
  }
}