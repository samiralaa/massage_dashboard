import { defineStore } from 'pinia';
import axios from 'axios';
import { API_URL } from './index.js';

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: [],
    count: 0,
    isLoading: false
  }),

  getters: {
    isInFavorites: (state) => (productId) => {
      return state.favorites.some(favorite => favorite.product_id === productId);
    }
  },

  actions: {
    async fetchFavorites() {
      if (!localStorage.getItem('auth_token')) {
        this.count = 0;
        return;
      }

      try {
        this.isLoading = true;
        const response = await axios.get(`${API_URL}/api/favorites`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        // Handle both response formats: direct array or {data: array}
        this.favorites = response.data.data || response.data;
        this.count = this.favorites.length;
      } catch (error) {
        console.error('Error fetching favorites:', error);
        this.count = 0;
      } finally {
        this.isLoading = false;
      }
    },

    async addToFavorites(productId) {
      try {
        const response = await axios.post(`${API_URL}/api/favorites`, {
          product_id: productId
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        // Immediately increment the count
        this.count++;
        
        // Refresh the full list
        await this.fetchFavorites();
        
        return response.data;
      } catch (error) {
        console.error('Error adding to favorites:', error);
        throw error;
      }
    },

    async removeFromFavorites(productId) {
      try {
        await axios.delete(`${API_URL}/api/favorites/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        // Immediately decrement the count
        this.count = Math.max(0, this.count - 1);
        
        // Refresh the full list
        await this.fetchFavorites();
      } catch (error) {
        console.error('Error removing from favorites:', error);
        throw error;
      }
    },

    setFavorites(favorites) {
      this.favorites = favorites;
      this.count = favorites.length;
    }
  }
}); 