<template>
  <h1>
    ================================================
    <p v-for="(data, index) in myArray" :kay="index">
      {{ data.category }}
    </p>
    <input type="text" v-model="name" />
    <button @click="increment">add in array</button>
  </h1>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      myArray: [
        { category: "Laravel" },
        { category: "PHP" },
        { category: "C++" },
        { category: "HTML" },
        { category: "CSS" },
      ],
    };
  },
  methods: {
    increment: function () {
      this.myArray.push({ category: this.name });
     
    },
  },
};
</script>
