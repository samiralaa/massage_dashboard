<template>
  <div class="logs-container">
    <div class="header">
      <h2>{{ $t("Logs.Logs") }}</h2>
      
    </div>

    <div class="table-responsive logs-table overflow-auto">
      <table class="table table-hover  align-middle">
        <thead>
          <tr>
            <th  scope="col">{{ $t("Logs.User") }}</th>
            <th scope="col">{{ $t("Logs.Operation") }}</th>
            <th scope="col">{{ $t("Logs.Model") }}</th>
            <th scope="col">{{ $t("Logs.ModelID") }}</th>
            <th scope="col">{{ $t("Logs.Description") }}</th>
            <th scope="col">{{ $t("Logs.IPAddress") }}</th>
            <th scope="col">{{ $t("Logs.BrowserInfo") }}</th>
            <th scope="col">{{ $t("Logs.Timestamp") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in logs" :key="index">
            <th class="align-middle">{{ log.user?.name }}</th>
            <td class="align-middle">{{ log.operation }}</td>
            <td class="align-middle">{{ log.model_type }}</td>
            <td class="align-middle">{{ log.model_id }}</td>
            <td class="align-middle">{{ log.description }}</td>
            <td class="align-middle">{{ log.ip_address }}</td>

            <td>
              <el-tooltip
                class="item"
                effect="dark"
                :content="log.user_agent"
                placement="top"
              >
                <span
                  class="d-inline-block text-truncate w-100"
                  style="max-width: 200px"
                >
                  {{ log.user_agent }}
                </span>
              </el-tooltip>
            </td>
            <td class="align-middle">{{ formatDate(log.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";

const logs = ref([]);
const loading = ref(false);

const BASE_URL = "https://backend.msgperfumes.com";
const API_URL = `${BASE_URL}/api/logs`;

const fetchLogs = async () => {
  loading.value = true;
  try {
    const tokenData = JSON.parse(localStorage.getItem("tokenData"));
    if (!tokenData || !tokenData.token)
      throw new Error("Authentication token not found");

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${tokenData.token}`;

    const res = await axios.get(API_URL);

    if (res.data.status === "success" || res.data.status === true) {
    

      logs.value = res.data.data;
    } else {
      throw new Error(res.data.message || "Failed to fetch logs");
    }
  } catch (err) {
    console.error("Log Fetch Error:", err);
    ElMessage.error(err.message || "Error fetching logs");
  } finally {
    loading.value = false;
  }
};
const formatDate =(dateString)=>{
const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.logs-container {
  /* padding: 24px; */
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.logs-table {
  background-color: #ffffff;
  /* padding: 10px; */
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  max-height: 70vh;
}
</style>
