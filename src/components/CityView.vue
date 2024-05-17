<template>
  <div class="hello">
    <h1>Citizen Count: {{citizenCount}}</h1>
    <button @click="createCitizen" :disabled="creatingCitizen">Create New Citizen</button>
    <br><br>
    <div>{{newCitizen}}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CityView',
  props: {
  },
  data() {
    return {
      url: "http://localhost:3000/",
      citizenCount : "?",
      creatingCitizen: false,
      newCitizen: {}
    }
  },
  methods: {
    getNumCitizens() {
      axios.get(this.url + "citizenCount")
      .then(response => {
        this.citizenCount = response.data.count;
      })
      .catch(error => {
        console.error(error);
      });
    },
    createCitizen() {
      this.creatingCitizen = true;
      axios.get(this.url + "createCitizen")
      .then(response => {
        this.newCitizen = response.data;
        this.getNumCitizens();
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        this.creatingCitizen = false;
      });
    }
  },
  computed: {
    // Add your computed properties here
  },
  mounted() {
    this.getNumCitizens();
  },
  // Add other lifecycle hooks here
}
</script>

<style scoped>
</style>
