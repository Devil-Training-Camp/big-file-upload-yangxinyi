<template>
  <homePage/>
  <a-button @click="foo"></a-button>
</template>

<script setup lang="ts">
import axios from 'axios';
import homePage from './components/homePage.vue'
const foo = () => {
  console.log('foo')
  axios.get('api/getData').then(res => {
    console.log(res)
  })
}
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
