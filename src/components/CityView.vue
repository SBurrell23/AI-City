<template>
  <div class="container">

    <div class="row">

      <div class="col">
        <h1>Citizen Count: {{citizenCount}}</h1>
        <button @click="createCitizen" :disabled="creatingCitizen">Create New Citizen</button>
        <br><br>
        <pre>{{newCitizen}}</pre>
      </div>

      <div class="col">
        <h4>Neighborhoods</h4>
        <ul>
          <li v-for="(hood,key) in neighborhoodStats" :key="key">
            {{ hood.count }} {{ hood.neighborhood }}
          </li>
        </ul>
      </div>

      <div class="col">
        <h4>Most Recent Births</h4>
        <ul>
          <li v-for="(citizen,key) in mostRecentCitizens" :key="key">
            {{ citizen.firstName }} {{ citizen.lastName }} ({{citizen.age}})
          </li>
        </ul>
      </div>

    </div>

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
      newCitizen: {},
      mostRecentCitizens: [],
      neighborhoodStats: {}
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
    getMostRecentCitizens() {
      axios.get(this.url + "mostRecentCitizens")
      .then(response => {
        this.mostRecentCitizens = response.data;
      })
      .catch(error => {
        console.error(error);
      });
    },
    getNeighborhoodStats() {
      axios.get(this.url + "neighborhoodStats")
      .then(response => {
        this.neighborhoodStats = response.data;
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
        this.getMostRecentCitizens();
        this.getNeighborhoodStats();
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
    this.getMostRecentCitizens();
    this.getNeighborhoodStats();
  },
  // Add other lifecycle hooks here
}
</script>

<style scoped>

li {
  text-align: left;
}

</style>
