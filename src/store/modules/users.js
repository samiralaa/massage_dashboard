export default {
  namespaced: true,
  state: {
    users: [],
    currentUser: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_USERS(state, users) {
      state.users = users
    },
    SET_CURRENT_USER(state, user) {
      state.currentUser = user
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    ADD_USER(state, user) {
      state.users.push(user)
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(user => user.id === updatedUser.id)
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser)
      }
    },
    DELETE_USER(state, userId) {
      state.users = state.users.filter(user => user.id !== userId)
    }
  },
  actions: {
    async fetchUsers({ commit }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const response = await this._vm.$axios.get('/api/users')
        const users = response.data.data || []
        
        commit('SET_USERS', users)
        return users
      } catch (error) {
        console.error('Fetch users error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createUser({ commit }, userData) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const response = await this._vm.$axios.post('/api/users', userData)
        const newUser = response.data.data

        commit('ADD_USER', newUser)
        return newUser
      } catch (error) {
        console.error('Create user error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create user'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateUser({ commit }, { userId, userData }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const response = await this._vm.$axios.put(`/api/users/${userId}`, userData)
        const updatedUser = response.data.data

        commit('UPDATE_USER', updatedUser)
        return updatedUser
      } catch (error) {
        console.error('Update user error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update user'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deleteUser({ commit }, userId) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        await this._vm.$axios.delete(`/api/users/${userId}`)
        commit('DELETE_USER', userId)
      } catch (error) {
        console.error('Delete user error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchCurrentUser({ commit }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const response = await this._vm.$axios.get('/api/me')
        const user = response.data.data

        commit('SET_CURRENT_USER', user)
        return user
      } catch (error) {
        console.error('Fetch current user error:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch current user'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    getUsers: state => state.users,
    getCurrentUser: state => state.currentUser,
    getUsersLoading: state => state.loading,
    getUsersError: state => state.error
  }
} 