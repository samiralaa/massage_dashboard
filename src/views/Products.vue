<template>
  <div class="products">
    <div class="header-actions">
      <el-button type="primary" @click="handleAddProduct">
        <el-icon><Plus /></el-icon>
        Add Product
      </el-button>
    </div>

    <el-table :data="products" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="price" label="Price" width="120">
        <template #default="scope">
          ${{ scope.row.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="Stock" width="120" />
      <el-table-column label="Actions" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">
            Edit
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { defineComponent, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Plus } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'ProductsView',
  components: {
    Plus
  },
  setup() {
    const store = useStore()

    onMounted(() => {
      store.dispatch('fetchProducts')
    })

    const handleAddProduct = () => {
      // TODO: Implement add product functionality
    }

    const handleEdit = (product) => {
    
      // TODO: Implement edit product functionality
    }

    const handleDelete = (product) => {
    
      // TODO: Implement delete product functionality
    }

    return {
      products: computed(() => store.state.products),
      handleAddProduct,
      handleEdit,
      handleDelete
    }
  }
})
</script>

<style scoped>
.products {
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 