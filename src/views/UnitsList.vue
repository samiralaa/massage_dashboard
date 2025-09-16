<template>
  <div>
    <h1>Units List</h1>
    <ul>
      <li v-for="unit in units" :key="unit.id">{{ unit.name }}</li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      units: []
    };
  },
  mounted() {
    axios.get('https://massagebackend.webenia.org/api/units')

      .then(response => {
        this.units = response.data;
      })
      .catch(error => {
        console.error('Error fetching units:', error);
      });
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>