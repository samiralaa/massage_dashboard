<template>
  <div class="analytics">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Sales Trend</span>
              <el-radio-group v-model="salesPeriod" size="small">
                <el-radio-button label="daily">Daily</el-radio-button>
                <el-radio-button label="weekly">Weekly</el-radio-button>
                <el-radio-button label="monthly">Monthly</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <!-- Sales chart will be implemented here -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Top Products</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- Products chart will be implemented here -->
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Customer Demographics</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- Demographics chart will be implemented here -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Order Status Distribution</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- Status distribution chart will be implemented here -->
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'AnalyticsView',
  setup() {
    const salesPeriod = ref('monthly')

    onMounted(() => {
      // TODO: Fetch analytics data
    })

    return {
      salesPeriod
    }
  }
})
</script>

<style scoped>
.analytics {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}

.mt-20 {
  margin-top: 20px;
}
</style> 