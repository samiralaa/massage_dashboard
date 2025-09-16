<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">Settings</h2>
    </div>
    
    <div class="settings-container">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span>General Settings</span>
          </div>
        </template>
        
        <el-form label-width="200px">
          <el-form-item label="Language">
            <el-select v-model="settings.language" placeholder="Select language">
              <el-option label="English" value="en" />
              <el-option label="Arabic" value="ar" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Theme">
            <el-select v-model="settings.theme" placeholder="Select theme">
              <el-option label="Light" value="light" />
              <el-option label="Dark" value="dark" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="saveSettings">Save Changes</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'SettingsView',
  setup() {
    const settings = ref({
      language: 'en',
      theme: 'light'
    })

    const saveSettings = () => {
      ElMessage({
        message: 'Settings saved successfully',
        type: 'success',
        duration: 2000
      })
    }

    return {
      settings,
      saveSettings
    }
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 