import axios from 'axios';
import { API_URL } from '../index';

export default {
  namespaced: true,
  state: {
    favorites: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_FAVORITES(state, favorites) {
      state.favorites = favorites;
    },
    ADD_FAVORITE(state, favorite) {
      state.favorites.push(favorite);
    },
    REMOVE_FAVORITE(state, productId) {
      state.favorites = state.favorites.filter(fav => fav.product_id !== productId);
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchFavorites({ commit }) {
      try {
        commit('SET_LOADING', true);
        const response = await axios.get(`${API_URL}/api/favorites`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        commit('SET_FAVORITES', response.data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async toggleFavorite({ commit }, product) {
      try {
        const response = await axios.post(`${API_URL}/api/favorites`, 
          { product_id: product.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );
        if (response.data.message) {
          // Check if the product is already in favorites
          const isInFavorites = this.getters['favorites/isInFavorites'](product.id);
          if (isInFavorites) {
            commit('REMOVE_FAVORITE', product.id);
          } else {
            commit('ADD_FAVORITE', { product_id: product.id, product });
          }
        }
        return response.data;
      } catch (error) {
        console.error('Error toggling favorite:', error);
        commit('SET_ERROR', error.message);
        throw error;
      }
    }
  },
  getters: {
    getFavorites: state => state.favorites,
    isInFavorites: state => productId => {
      return state.favorites.some(fav => fav.product_id === productId);
    },
    favoritesCount: state => state.favorites.length,
    isLoading: state => state.loading,
    getError: state => state.error
  }
}; 