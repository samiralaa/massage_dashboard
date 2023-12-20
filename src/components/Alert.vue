<template>
  <div>
    <!-- Button to trigger the alert -->
    <button @click="showAlert">Show Alert</button>

    <!-- Alert box (conditionally rendered) -->
    <div v-if="isAlertVisible" class="alert">
      <p>This is an alert!</p>
      <button @click="hideAlert">Close</button>
    </div>
  </div>
  <div>
    <button @click="GetData">Get All Dta</button>
    <div v-if="data" class="data">
      <p>This all datat</p>
      <button @click="hideData">console</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isAlertVisible: false,
      data: false,
    };
  },
  methods: {
    showAlert() {
      // Set the data property to true to show the alert
      this.isAlertVisible = true;
    },
    hideAlert() {
      // Set the data property to false to hide the alert
      this.isAlertVisible = false;
    },
    GetData() {
      this.data = true;
    },
    hideData() {
      this.data = false;
    },
  },
};
</script>

<style>
.alert {
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
  background-color: #f8d7da; /* Bootstrap's danger color */
  color: #721c24; /* Bootstrap's danger text color */
}
.data {
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
  background-color: #f8d7da; /* Bootstrap's danger color */
  color: #0e0791; /* Bootstrap's danger text color */
}
</style>
