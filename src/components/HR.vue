<template>
  <h1>HR</h1>
  <div class="hr-date">
    <div v-for="(employes, index) in HR" :key="index">
      <p>
        <span>{{ employes.phone}}</span>
       
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: "HR",
  props: ["HR"],
};
</script>
<style>
h1 {
  color: blue;
}
</style>
