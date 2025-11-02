<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ $t("customers.title") }}</h2>
      <div class="button-group">
        <el-button
          type="success"
          class="action-button"
          @click="showCreateDialog"
        >
          <el-icon>
            <Plus />
          </el-icon>
          <span>{{ $t("customers.addCustomer") }}</span>
        </el-button>
        <el-button type="primary" class="action-button" @click="loadCustomers">
          <el-icon>
            <Refresh />
          </el-icon>
          <span>{{ $t("customers.refrech") }}</span>
        </el-button>
      </div>
    </div>

    <!-- Error Alert -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      @close="clearError"
      class="mb-md"
    />

    <!-- Create User Dialog -->
    <el-dialog
      v-model="createDialogVisible"
      :title="$t('customers.addCustomer')"
      width="500px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="120px"
        class="form-container"
        @submit.prevent="handleCreate"
      >
        <el-form-item :label="$t('customers.name')" prop="name">
          <el-input
            v-model="createForm.name"
            :placeholder="$t('customers.Enter-name')"
          />
        </el-form-item>
        <el-form-item :label="$t('customers.email')" prop="email">
          <el-input
            v-model="createForm.email"
            :placeholder="$t('customers.Enter-email')"
          />
        </el-form-item>

        <el-form-item :label="$t('customers.role')" prop="role">
          <el-select
            v-model="createForm.role"
            :placeholder="$t('customers.Enter-role')"
          >
            <el-option :label="$t('customers.admin')" value="admin" />
            <el-option :label="$t('customers.user')" value="user" />
            <el-option :label="$t('customers.manager')" value="manager" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('customers.country')" prop="country_id">
            <el-select
              v-model="createForm.country_id"
              :placeholder="$t('customers.Enter-address')"
              @change="getCountryCode"
            >
              <el-option
                v-for="country in countries"
                :key="country.id"
                :label="country.name_en"
                :value="country.id"
              />
            </el-select>
        </el-form-item>

        <el-form-item :label="$t('customers.phone')" prop="phone">
          <el-input
          
            v-model="createForm.phone"
            style="max-width: 600px"
            :placeholder="$t('customers.Enter-phone')"
          >
            <template #prepend v-if="createForm.dialing_code">+{{ createForm.dialing_code }}</template>
          </el-input>

          <!-- <el-input
            v-model="createForm.phone"
            :placeholder="$t('customers.Enter-phone')"
          /> -->
        </el-form-item>

        <el-form-item :label="$t('customers.password')" prop="password">
          <el-input
            v-model="createForm.password"
            type="password"
            :placeholder="$t('customers.Enter-password')"
            show-password
          />
        </el-form-item>
        <el-form-item
          :label="$t('customers.confirmPassword')"
          prop="password_confirmation"
        >
          <el-input
            v-model="createForm.password_confirmation"
            type="password"
            :placeholder="$t('customers.Enter-comfirmPassword')"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="form-footer">
          <el-button @click="createDialogVisible = false">{{
            $t("customers.cancel")
          }}</el-button>
          <el-button type="primary" :loading="isLoading" @click="handleCreate">
            {{ $t("customers.create") }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="card">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- Users Table -->
    <div v-else class="table-container">
      <el-table :data="usersList" style="width: 100%" :border="true">
        <el-table-column
          prop="id"
          :label="$t('customers.customer-id')"
          width="80"
        />
        <el-table-column
          prop="name"
          :label="$t('customers.name')"
          min-width="120"
        />
        <el-table-column
          prop="email"
          :label="$t('customers.email')"
          min-width="180"
        />
        <el-table-column
          prop="phone"
          :label="$t('customers.phone')"
          min-width="120"
        />
        <el-table-column prop="role" :label="$t('customers.role')" width="120">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)" class="status-tag">
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          :label="$t('customers.Created-At')"
          width="150"
        >
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('customers.actions')"
          width="150"
          fixed="right"
        >
          <template #default="scope">
            <div class="button-group">
              <el-tooltip
                :content="$t('customers.editCustomer')"
                placement="top"
              >
                <el-button
                  type="primary"
                  size="small"
                  class="action-button"
                  @click="handleEdit(scope.row)"
                >
                  <el-icon>
                    <Edit />
                  </el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip
                :content="$t('customers.deleteCustomer')"
                placement="top"
              >
                <el-button
                  type="danger"
                  size="small"
                  class="action-button"
                  @click="handleDelete(scope.row)"
                >
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <el-empty
        v-if="!isLoading && usersList.length === 0"
        description="No users found"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, onMounted, ref, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh, Edit, Delete, Plus } from "@element-plus/icons-vue";
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "https://massagebackend.webenia.org/api",

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: false,
});
const countries = ref([]);

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const tokenData = JSON.parse(localStorage.getItem("tokenData"));
    if (tokenData?.token) {
      config.headers.Authorization = `Bearer ${tokenData.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tokenData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default defineComponent({
  name: "CustomersView",
  components: {
    Refresh,
    Edit,
    Delete,
    Plus,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const createFormRef = ref(null);
    const createDialogVisible = ref(false);
    const usersList = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const lang = localStorage.getItem("lang") || "en";
    const createForm = reactive({
      name: "",
      email: "",
      phone: "",
      role: "user",
      country_id: "",
      password: "",
      password_confirmation: "",
      dialing_code: "",
    });
    const countryCodes = {
      1: "93", // Afghanistan
      2: "355", // Albania
      3: "213", // Algeria
      4: "376", // Andorra
      5: "244", // Angola
      6: "973", // Bahrain
      7: "880", // Bangladesh
      8: "32", // Belgium
      9: "55", // Brazil
      10: "1", // Canada
      11: "86", // China
      12: "20", // Egypt
      13: "33", // France
      14: "49", // Germany
      15: "30", // Greece
      16: "91", // India
      17: "62", // Indonesia
      18: "98", // Iran
      19: "964", // Iraq
      20: "353", // Ireland
      21: "39", // Italy
      22: "81", // Japan
      23: "962", // Jordan
      24: "7", // Kazakhstan
      25: "254", // Kenya
      26: "965", // Kuwait
      27: "961", // Lebanon
      28: "218", // Libya
      29: "60", // Malaysia
      30: "52", // Mexico
      31: "212", // Morocco
      32: "977", // Nepal
      33: "31", // Netherlands
      34: "64", // New Zealand
      35: "234", // Nigeria
      36: "968", // Oman
      37: "92", // Pakistan
      38: "970", // Palestine
      39: "974", // Qatar
      40: "7", // Russia
      41: "966", // Saudi Arabia
      42: "65", // Singapore
      43: "27", // South Africa
      44: "82", // South Korea
      45: "34", // Spain
      46: "249", // Sudan
      47: "46", // Sweden
      48: "41", // Switzerland
      49: "963", // Syria
      50: "886", // Taiwan
      51: "255", // Tanzania
      52: "66", // Thailand
      53: "216", // Tunisia
      54: "90", // Turkey
      55: "256", // Uganda
      56: "380", // Ukraine
      57: "971", // UAE
      58: "44", // UK
      59: "1", // USA
      60: "998", // Uzbekistan
      61: "84", // Vietnam
      62: "967", // Yemen
      63: "263", // Zimbabwe
    };
    const fetchCountries = async () => {
      try {
        const response = await api.get("/countries");
        countries.value = response.data.data;
        console.log("Countries loaded:", countries.value);
      } catch (err) {
        console.error("Failed to load countries:", err);
      }
    };
    const createRules = {
      name: [
        {
          required: true,
          message: lang === "en" ? "Please enter name" : " من فضلك ادخل الاسم",
          trigger: "blur",
        },
        {
          min: 3,
          message:
            lang === "en"
              ? "Name must be at least 3 characters"
              : "الاسم يجب ان يكون على الاقل 3 حروف",
          trigger: "blur",
        },
      ],
      email: [
        {
          required: true,
          message:
            lang === "en"
              ? "Please enter email"
              : "من فضلك ادخل البريد الالكتروني",
          trigger: "blur",
        },
        {
          type: "email",
          message:
            lang === "en"
              ? "Please enter valid email"
              : " من فضلك ادخل بريد الكتروني صحيح",
          trigger: "blur",
        },
      ],
      phone: [
        {
          required: true,
          message:
            lang === "en"
              ? "Please enter phone number"
              : "من فضلك ادخل رقم الهاتف",
          trigger: "blur",
        },
        {
          pattern: /^1[0-9]{9}$/,
          message:
            lang === "en"
              ? "Enter 10-digit number without country code"
              : " ادخل  10 رقم بدون رمز الدولة",
          trigger: "blur",
        },
      ],
      role: [
        {
          required: true,
          message:
            lang === "en" ? "Please select role" : "من فضلك اختر الصلاحية",
          trigger: "change",
        },
      ],
      country_id: [
        {
          required: true,
          message:
            lang === "en" ? "Please select country" : "من فضلك اختر الدولة",
          trigger: "change",
        },
      ],
      password: [
        {
          required: true,
          message:
            lang === "en"
              ? "Please enter password"
              : "من فضلك ادخل كلمة المرور",
          trigger: "blur",
        },
        {
          min: 6,
          message:
            lang === "en"
              ? "Password must be at least 6 characters"
              : "كلمة المرور يجب ان تكون على الاقل 6 حروف",
          trigger: "blur",
        },
      ],
      password_confirmation: [
        {
          required: true,
          message:
            lang === "en"
              ? "Please confirm password"
              : "من فضلك ادخل تاكيد كلمة المرور",
          trigger: "blur",
        },
        {
          validator: (rule, value, callback) => {
            if (value !== createForm.password) {
              callback(
                new Error(
                  lang === "en"
                    ? "Passwords do not match"
                    : "كلمات المرور غير متطابقة"
                )
              );
            } else {
              callback();
            }
          },
          trigger: "blur",
        },
      ],
    };

    const getRoleType = (role) => {
      const types = {
        admin: "danger",
        manager: "warning",
        user: "success",
      };
      return types[role] || "info";
    };

    const showCreateDialog = () => {
      createDialogVisible.value = true;
      createForm.name = "";
      createForm.email = "";
      createForm.phone = "";
      createForm.role = "user";
      createForm.country_id = "";
      createForm.password = "";
      createForm.password_confirmation = "";
    };

    const handleCreate = async () => {
      if (!createFormRef.value) return;
      createForm.dialing_code = countryCodes[createForm.country_id] || "";
      try {
        await createFormRef.value.validate();
        isLoading.value = true;

        const response = await api.post("/users", createForm);

        if (response.data.status) {
          ElMessage({
            message:
              lang === "en"
                ? "User created successfully"
                : "تم إنشاء المستخدم بنجاح",
            type: "success",
            duration: 2000,
          });
          createDialogVisible.value = false;
          loadCustomers();
        } else {
          throw new Error(response.data.message || "Failed to create user");
        }
      } catch (err) {
        console.error("Error creating user:", err.response?.data?.message);
        if (err.response?.data?.message.includes('This email is already taken')) {
          ElMessage({
          message:
            lang === "en" ? "This email is already taken" : "هذا البريد الالكتروني مستخدم بالفعل",
          type: "error",
          duration: 5000,
        });
        }else{

          ElMessage({
            message:
            lang === "en" ? "Failed to create user" : "فشل في إنشاء المستخدم",
            type: "error",
            duration: 5000,
          });
        }
      } finally {
        isLoading.value = false;
      }
    };


const getCountryCode = (id) => {
      createForm.dialing_code = countryCodes[id] || "";
    };




    const loadCustomers = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        // Get token data and log it for debugging
        const tokenData = JSON.parse(localStorage.getItem("tokenData"));

        if (!tokenData?.token) {
          console.error("No token found");
          router.push("/login");
          return;
        }

        // Log the request details

        // Using Vuex store to load customers
        await store.dispatch("fetchCustomers");
        usersList.value = store.getters.getCustomers;
      } catch (err) {
        console.error("Error loading customers:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        error.value =
          err.response?.data?.message ||
          err.message ||
          "Failed to load customers";

        if (err.response?.status === 401) {
          localStorage.removeItem("tokenData");
          router.push("/login");
        }
      } finally {
        isLoading.value = false;
      }
    };

    const handleEdit = async (user) => {
      try {
        const response = await api.put(`/users/${user.id}`, user);

        if (response.data.status) {
          ElMessage({
            message: "User updated successfully",
            type: "success",
            duration: 2000,
          });
          loadCustomers();
        } else {
          throw new Error(response.data.message || "Failed to update user");
        }
      } catch (err) {
        console.error("Error updating user:", err);
        ElMessage({
          message:
            lang === "en"
              ? err.response?.data?.message || "Failed to update user"
              : "فشل في تحديث المستخدم",
          type: "error",
          duration: 5000,
        });
      }
    };

    const handleDelete = async (user) => {
      try {
        await ElMessageBox.confirm(
          lang === "en"
            ? `Are you sure you want to delete user ${user.name}?`
            : `هل أنت متأكد من حذف المستخدم ${user.name}?`,
          lang === "en" ? "Warning" : "تحذير",
          {
            confirmButtonText: lang === "en" ? "Delete" : "حذف",
            cancelButtonText: lang === "en" ? "Cancel" : "إلغاء",
            type: "warning",
          }
        );

        const response = await api.delete(`/users/${user.id}`);

        if (response.data.status) {
          ElMessage({
            message:
              lang === "en"
                ? "User deleted successfully"
                : "تم حذف المستخدم بنجاح",
            type: "success",
            duration: 2000,
          });
          loadCustomers();
        } else {
          throw new Error(response.data.message || "Failed to delete user");
        }
      } catch (err) {
        if (err !== "cancel") {
          console.error("Error deleting user:", err);
          ElMessage({
            message:
              lang === "en" ? "Failed to delete user" : "فشل في حذف المستخدم",
            type: "error",
            duration: 5000,
          });
        }
      }
    };

    const formatDate = (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const clearError = () => {
      error.value = null;
    };

    onMounted(() => {
      loadCustomers();
      fetchCountries();
    });

    return {
      usersList,
      isLoading,
      error,
      loadCustomers,
      handleEdit,
      handleDelete,
      formatDate,
      clearError,
      createDialogVisible,
      createForm,
      createRules,
      createFormRef,
      showCreateDialog,
      handleCreate,
      getRoleType,
      countries,
      getCountryCode
    };
  },
});
</script>

<style>
@import "@/assets/styles/variables.css";
@import "@/assets/styles/common.css";

/* Additional component-specific styles if needed */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-tag) {
  text-transform: capitalize;
}

.empty-state {
  padding: var(--spacing-xl) 0;
  text-align: center;
}
</style>
