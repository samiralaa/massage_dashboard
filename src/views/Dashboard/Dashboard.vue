<template>
  <div
    class="dashboard d-flex flex-wrap flex-grow-1 container-fluid px-2 px-md-4"
  >
    <div class="row w-100 g-3">
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card class="summary-card h-100">
          <template #header>
            <div class="card-header">
              <span>{{ $t("dashboard.Total-Revenue") }}</span>
            </div>
          </template>
          <div class="card-content">
            <h2>${{  salesOverview.converted_total_sales.toFixed(2) }}</h2>
            <span
              :class="[
                'trend',
                salesOverview.month_over_month_growth >= 0
                  ? 'positive'
                  : 'negative',
              ]"
            >
              {{ salesOverview.month_over_month_growth >= 0 ? "+" : ""
              }}{{ salesOverview.month_over_month_growth }}%
            </span>
            <div v-if="salesOverview.converted_total_sales">
              <small>
                ({{ salesOverview.converted_total_sales.toFixed(2) }}
                {{ salesOverview.converted_currency }})
              </small>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card class="summary-card h-100">
          <template #header>
            <div class="card-header">
              <span>{{ $t("dashboard.total-Orders") }}</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ totalOrders }}</h2>
            <!-- <span class="trend positive">+8%</span> -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card class="summary-card h-100">
          <template #header>
            <div class="card-header">
              <span>{{ $t("dashboard.total-Customers") }}</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ totalCustomers }}</h2>
            <!-- <span class="trend positive">+5%</span> -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24" :sm="12" :md="6">
        <el-card class="summary-card h-100">
          <template #header>
            <div class="card-header">
              <span>{{ $t("dashboard.total-Products") }}</span>
            </div>
          </template>
          <div class="card-content">
            <h2>{{ totalProducts }}</h2>
            <!-- <span class="trend positive">+3%</span> -->
          </div>
        </el-card>
      </el-col>
    </div>

    <div class="container-fluid mt-3">
      <!-- Sales Overview Card -->
      <div class="w-100 mb-3">
        <el-card class="w-100">
          <template #header>
            <div class="card-header">
              <span>{{ $t("dashboard.Sales-Overview") }}</span>
            </div>
          </template>
          <div class="sales-overview">
            <div class="sales-metrics">
              <div class="metric">
                <span class="label">{{ $t("dashboard.Today-Sales") }}</span>
                <span class="value"
                  >${{
                    parseFloat(salesOverview.today_sales || 0).toFixed(2)
                  }}</span
                >
              </div>
              <div class="metric">
                <span class="label">{{ $t("dashboard.This-Month") }}</span>
                <span class="value"
                  >${{
                    parseFloat(salesOverview.this_month_sales || 0).toFixed(2)
                  }}</span
                >
              </div>
              <div class="metric">
                <span class="label">{{ $t("dashboard.Last-Month") }}</span>
                <span class="value"
                  >${{
                    parseFloat(salesOverview.last_month_sales || 0).toFixed(2)
                  }}</span
                >
              </div>
            </div>
            <div id="salesChart" class="chart-container"></div>
          </div>
        </el-card>
      </div>

      <!-- Recent Orders Card -->
      <div class="w-100">
        <el-card class="w-100">
          <template #header>
            <div class="d-flex gap-2 align-items-center">
              <span>{{ $t("dashboard.recent-Orders") }}</span>
              <span  class="badge text-bg-secondary p-2 position-relative">
                {{ orders.count ? `+ ${orders.count}` : 'No Orders' }}
                <span
                  class="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle"
                >
                </span>
              </span>
            </div>
          </template>

          <div class="overflow-auto">
            <table class="table table-hover table-responsive align-middle">
              <thead>
                <tr>
                  <!-- <th scope="col">{{ $t('dashboard.Order-Id') }}</th> -->
                  <th scope="col">{{ $t("dashboard.customer") }}</th>
                  <th scope="col">{{ $t("dashboard.address") }}</th>
                  <th scope="col">{{ $t("dashboard.Total") }}</th>
                  <th scope="col">{{ $t("dashboard.payment-method") }}</th>
                  <th scope="col">{{ $t("dashboard.Order-Date") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(order, index) in orders.orders" :key="index">
                 
                  <td class="align-middle">
                    <div class="d-flex align-items-center gap-2">
                      <div
                        class="avatar bg-primary text-white rounded-circle d-flex justify-content-center px-3 py-2 align-items-center"
                      >
                        {{
                          order.user.name
                            ? order.user.name.charAt(0).toUpperCase()
                            : "?"
                        }}
                      </div>
                      <div class="user-info">
                        <h6 class="mb-0">{{ order.user.name }}</h6>
                        <small class="text-muted">{{ order.user.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td class="align-middle">
                    {{ order.address?.country?.name_en }}
                  </td>
                  <td class="align-middle">
                    {{ order.total_price }} {{ order.currency }}
                  </td>
                  <td class="align-middle text-capitalize text-center">
                    {{ order.payment_method }}
                  </td>
                  <td class="align-middle">{{ order.ordered_at }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
  onMounted,
  ref,
  onBeforeUnmount,
} from "vue";
import { useStore } from "vuex";
import axios from "axios";
import * as echarts from "echarts";

export default defineComponent({
  name: "DashboardView",
  setup() {
    const store = useStore();
    const totalRevenue = ref(0);
    const totalOrders = ref(0);
    const totalCustomers = ref(0);
    const totalProducts = ref(0);
    const orders = ref([]);
 
    const salesOverview = ref({
      today_sales: 0,
      this_month_sales: 0,
      last_month_sales: 0,
      month_over_month_growth: 0,
      daily_sales: [],
      top_selling_products: [],
      converted_total_sales: 0,
      converted_currency: "",
    });
    let chartInstance = null;



  const initChart = () => {
  const chartDom = document.getElementById('salesChart');
  if (chartDom) {
    chartInstance = echarts.init(chartDom);
    updateChart(); // رسم الشارت بعد التهيئة
  }
};

// رسم الشارت
const updateChart = () => {
  if (!chartInstance || !Array.isArray(salesOverview.value.daily_sales)) return;

  const salesData = salesOverview.value.daily_sales;

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Sales', 'Orders'],
    },
    xAxis: {
      type: 'category',
      data: salesData.map((item) => item.date),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Sales',
        type: 'line',
        data: salesData.map((item) => parseFloat(item.total_sales || 0)),
      },
      {
        name: 'Orders',
        type: 'line',
        data: salesData.map((item) => item.total_orders || 0),
      },
    ],
  };

  chartInstance.setOption(option);
};

const fetchSalesOverview = async () => {
  try {
    const response = await axios.get('https://backend.msgperfumes.com/api/dashboard/sales-overview');

    // الوصول للبيانات الحقيقية بشكل صحيح
    salesOverview.value = response.data.data.original.data;

    totalRevenue.value = parseFloat(salesOverview.value.total_sales || 0);

    // تأكد أن daily_sales موجودة قبل رسم الشارت
    if (Array.isArray(salesOverview.value.daily_sales)) {
      updateChart();
    } else {
      console.warn('daily_sales is missing or not an array');
    }
  } catch (error) {
    console.error('Error fetching sales overview:', error);
  }
};


    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };

   onMounted(async () => {
  initChart(); // تهيئة أولية

  window.addEventListener("resize", handleResize);

  try {
    await fetchTotalOrders();
    await store.dispatch("fetchCustomers");
    await fetchTotalProducts();
    await fetchRecentOrders();
    await fetchSalesOverview(); // جلب البيانات ورسم الشارت
    totalCustomers.value = store.getters.totalCustomers || 0;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
});


    onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.dispose();
      }
      window.removeEventListener("resize", handleResize);
    });



    const fetchTotalProducts = async () => {
      try {
        const tokenData = JSON.parse(localStorage.getItem("tokenData"));
        if (!tokenData || !tokenData.token) {
          throw new Error("Authentication token not found");
        }

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${tokenData.token}`;
        const response = await axios.get(
          "https://backend.msgperfumes.com/api/dashboard/total-products"
        );

        if (response.data.status === true) {
          totalProducts.value = response.data.data.total_products;
        }
      } catch (error) {
        console.error("Error fetching total products:", error);
      }
    };

    const fetchTotalOrders = async () => {
      try {
        const tokenData = JSON.parse(localStorage.getItem("tokenData"));
        if (!tokenData || !tokenData.token) {
          throw new Error("Authentication token not found");
        }

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${tokenData.token}`;
        const response = await axios.get(
          "https://backend.msgperfumes.com/api/dashboard/total-orders"
        );

        if (response.data.status === true) {
          totalOrders.value = response.data.data.total_orders;
        }
      } catch (error) {
        console.error("Error fetching total orders:", error);
      }
    };

    const fetchRecentOrders = async () => {
      try {
        const tokenData = JSON.parse(localStorage.getItem("tokenData"));
        if (!tokenData || !tokenData.token) {
          throw new Error("Authentication token not found");
        }

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${tokenData.token}`;
        const response = await axios.get(
          "https://backend.msgperfumes.com/api/orders/count/new"
        );

        if (response.data.status === true) {
          orders.value = response.data.data;
          console.log("Recent Orders:", orders.value);
        }
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      }
    };

    onMounted(async () => {
      try {
        await fetchTotalOrders();
        await store.dispatch("fetchCustomers");
        await fetchTotalProducts();
        await fetchRecentOrders();
        await fetchSalesOverview();

        // Update values after fetching data
        totalCustomers.value = store.getters.totalCustomers || 0;
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    });

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      orders,
      salesOverview,
    };
  },
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.summary-card {
  margin-bottom: 20px;
}



.card-content {
  text-align: center;
}

.card-content h2 {
  margin: 10px 0;
  font-size: 24px;
}

.trend {
  font-size: 14px;
}

.trend.positive {
  color: #67c23a;
}

.trend.negative {
  color: #f56c6c;
}

.chart-row {
  margin-top: 20px;
}

.sales-overview {
  padding: 10px;
}

.sales-metrics {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.metric {
  text-align: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  flex: 1;
  margin: 0 5px;
}

.metric .label {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.metric .value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.chart-container {
  height: 400px;
  margin-top: 20px;
  width: 100%;
}
.table-responsive {
  overflow-x: auto;
}
.chart-container {
  height: 400px;
  width: 100%;
  margin-top: 20px;
}
</style>
