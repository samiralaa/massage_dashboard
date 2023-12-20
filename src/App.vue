<script setup>
import Alert from './components/Alert.vue'

import IT from "./components/IT.vue";
import HR from "./components/HR.vue";
import Welcome from "./components/Welcome.vue";
import GetLen from "./components/GetLen.vue";
</script>

<template>
  <Alert></Alert>
  <IT v-bind:IT="employess"></IT>
  <div class="my-main">
    <HR v-bind:HR="employess"></HR>
  </div>
  <Welcome v-bind:massage="massage"></Welcome>
  <GetLen></GetLen>
</template>
<script>
export default {
  name: "App",
  components: {
    IT,
    HR,
    Welcome,
    GetLen,
    Alert,
    Alert,
    
  },
  data() {
    {
      return {
        employess: [
          {
            id: 1,
            name: "hr one",
            sex: "男",
            age: 18,
            phone: "18888888888",
          },
          {
            id: 2,
            name: "hr 2",
            sex: "女",
            age: 19,
            phone: "19999999999",
          },
          {
            id: 3,
            name: "hr 3",
            sex: "男",
            age: 20,
            phone: "20000000000",
          },
        ],
        massage: "welcome in vue ",
        
      };
      
    }
  },
};
</script>
<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
