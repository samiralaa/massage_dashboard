import axios from 'axios'


const API_URL = 'https://massagebackend.webenia.org'
const IMAGE_BASE_URL = 'https://massagebackend.webenia.org'

const state = {
  items: [],
  loading: false,
  error: null
}

const mutations = {
  SET_CATEGORIES(state, categories) {
    state.items = categories
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  ADD_CATEGORY(state, category) {
    state.items.push(category)
  },
  UPDATE_CATEGORY(state, updatedCategory) {
    const index = state.items.findIndex(c => c.id === updatedCategory.id)
    if (index !== -1) {
      state.items.splice(index, 1, updatedCategory)
    }
  },
  REMOVE_CATEGORY(state, categoryId) {
    state.items = state.items.filter(c => c.id !== categoryId)
  }
}

const actions = {
  async fetchCategories({ commit, rootState }) {
    try {
      if (!rootState.token) {
        throw new Error('Authentication required')
      }

      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      const tokenData = JSON.parse(localStorage.getItem('tokenData'))
      if (tokenData?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`
      }

      const response = await axios.get(`${API_URL}/api/categories`)

      if (response.data?.status && response.data?.data) {
        const transformedCategories = response.data.data.map(category => ({
          id: category.id,
          name: category.name_en,
          name_ar: category.name_ar,
          description: category.description_en,
          description_ar: category.description_ar,
          image: category.images?.[0]?.path ? `${IMAGE_BASE_URL}/${category.images[0].path}` : null,
          created_at: category.created_at,
          updated_at: category.updated_at,
          deleted_at: category.deleted_at
        }))

        commit('SET_CATEGORIES', transformedCategories)
        return transformedCategories
      } else {
        throw new Error(response.data?.message || 'Failed to fetch categories')
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch categories'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createCategory({ commit, rootState }, categoryData) {
    try {
      if (!rootState.token) {
        throw new Error('Authentication required')
      }

      commit('SET_LOADING', true)
      const formData = new FormData()
      formData.append('name_en', categoryData.name)
      formData.append('name_ar', categoryData.name_ar)
      formData.append('description_en', categoryData.description)
      formData.append('description_ar', categoryData.description_ar)
      formData.append('brand_id', categoryData.brand_id)

      if (categoryData.image) {
        formData.append('image', categoryData.image)
      }

      const response = await axios.post(`${API_URL}/api/categories`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data?.status && response.data?.data) {
        const transformedCategory = {
          id: response.data.data.id,
          name: response.data.data.name_en,
          name_ar: response.data.data.name_ar,
          description: response.data.data.description_en,
          description_ar: response.data.data.description_ar,
          image: response.data.data.images?.[0]?.path ? `${IMAGE_BASE_URL}/${response.data.data.images[0].path}` : null,
          created_at: response.data.data.created_at,
          updated_at: response.data.data.updated_at,
          deleted_at: response.data.data.deleted_at
        }

        commit('ADD_CATEGORY', transformedCategory)
        return transformedCategory
      } else {
        throw new Error(response.data?.message || 'Failed to create category')
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateCategory({ commit, rootState }, { id, ...categoryData }) {
    try {
      if (!rootState.token) {
        throw new Error('Authentication required')
      }

      commit('SET_LOADING', true)

      const formData = new FormData()
      formData.append('name_en', categoryData.name)
      formData.append('name_ar', categoryData.name_ar)
      formData.append('description_en', categoryData.description)
      formData.append('description_ar', categoryData.description_ar)
      formData.append('brand_id', categoryData.brand_id)

      if (categoryData.image instanceof File) {
        formData.append('image', categoryData.image)
      }

      const response = await axios.post(`${API_URL}/api/categories/${id}?_method=PUT`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data?.status && response.data?.data) {
        const transformedCategory = {
          id: response.data.data.id,
          name: response.data.data.name_en,
          name_ar: response.data.data.name_ar,
          description: response.data.data.description_en,
          description_ar: response.data.data.description_ar,
          image: response.data.data.images?.[0]?.path ? `${IMAGE_BASE_URL}/${response.data.data.images[0].path}` : null,
          created_at: response.data.data.created_at,
          updated_at: response.data.data.updated_at,
          deleted_at: response.data.data.deleted_at
        }

        commit('UPDATE_CATEGORY', transformedCategory)
        return transformedCategory
      } else {
        throw new Error(response.data?.message || 'Failed to update category')
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteCategory({ commit, rootState }, categoryId) {
    try {
      if (!rootState.token) {
        throw new Error('Authentication required')
      }

      commit('SET_LOADING', true)
      const response = await axios.delete(`${API_URL}/api/categories/${categoryId}`)

      if (response.data?.status) {
        commit('REMOVE_CATEGORY', categoryId)
      } else {
        throw new Error(response.data?.message || 'Failed to delete category')
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  getCategories: state => state.items,
  isLoading: state => state.loading,
  getError: state => state.error
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
