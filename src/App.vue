<template>
  <div id="app">
    <NameRegistration />
  </div>
</template>

<script>
import NameRegistration from './components/NameRegistration.vue'

export default {
  name: 'app',
  components: {
    NameRegistration
  },
  created () {
    if(window.parent === window) {
      // TODO THROW ERROR: NO BASE AEPP
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-height: 100vh;
  height: 100vh;
  overflow-y: auto;
  background-color: white;
}
</style>
