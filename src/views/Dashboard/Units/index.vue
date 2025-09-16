<template>
  <div class="units-container">
    <div class="header">
      <h2>{{ $t('input.unites.Units-List') }}</h2>
      <el-button type="primary" :to="'/units/create'" tag="router-link">{{ $t('input.unites.add-unit') }}</el-button>
    </div>

    <el-card class="units-table">
      <el-table v-loading="loading" :data="units" style="width: 100%">
        <el-table-column prop="name_ar" :label=" $t('input.unites.name-ar') " />
        <el-table-column prop="name_en" :label=" $t('input.unites.name-en') " />
        <el-table-column :label=" $t('input.unites.action') ">
          <template v-slot="scope">
            <el-button type="text" size="small" @click="handleUpdate(scope.row)">{{ $t('input.unites.update') }}</el-button>
            <el-button type="text" size="small" @click="handleDelete(scope.row)">{{ $t('input.unites.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessageBox } from 'element-plus';

const units = ref([])
const loading = ref(false)

const BASE_URL = 'https://massagebackend.webenia.org'

const API_URL = `${BASE_URL}/api/units`

const fetchUnits = async () => {
  loading.value = true
  try {
    const tokenData = JSON.parse(localStorage.getItem('tokenData'))
    if (!tokenData || !tokenData.token) {
      throw new Error('Authentication token not found')
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`

    const response = await axios.get(API_URL)

    if (response.data.status) {
      units.value = response.data.data
    } else {
      throw new Error(response.data.message || 'Failed to fetch units')
    }
  } catch (error) {
    console.error('Fetch units error:', error)
  } finally {
    loading.value = false
  }
}

const openAddUnitModal = () => {

  // Logic to open a modal or redirect to a form for adding a new unit

}

onMounted(() => {
  fetchUnits()
})

const handleUpdate = (unit) => {
  // Logic to update the unit

}

const handleDelete = async (unit) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this unit?', 'Warning', {
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      type: 'warning'
    });

    const response = await axios.delete(`${API_URL}/${unit.id}`);
    if (response.data.status ) {
   
      fetchUnits();
    } else {
      throw new Error(response.data.message || 'Failed to delete unit');
    }
  } catch (error) {
    console.error('Delete unit error:', error);
  }
};

</script>

<style scoped>
.units-container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.units-table {
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table-column {
  text-align: center;
}

.el-button {
  margin: 5px;
}
</style>
  