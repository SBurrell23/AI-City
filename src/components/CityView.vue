<template>
  <div class="container">

    <div class="row">

      Citizen Count: {{citizenCount}}

      <div class="col-12">
        <PersonDetails :person="newestCitizen" />
      </div>

      <div class="col-4">
        <h4 class="subHeader">Neighborhoods</h4>
        <ul>
          <li v-for="(hood,key) in neighborhoodStats" :key="key">
            {{ hood.count }} {{ hood.neighborhood }}
          </li>
        </ul>
      </div>

      <div class="col-4">
        <h4 class="subHeader">Most Recent Births</h4>
        <ul>
          <li v-for="(citizen,key) in mostRecentCitizens" :key="key">
            {{ citizen.firstName }} {{ citizen.lastName }}
          </li>
        </ul>
      </div>

      <div class="col-4">
        <h4 class="subHeader">Population Age Distribution</h4>
        <table class="table table-sm table-bordered">
          <thead>
        <tr>
          <th>Age Group</th>
          <th>Count</th>
          <th>Percent</th>
        </tr>
          </thead>
          <tbody>
        <tr v-for="(age, key) in populationAgeDistribution" :key="key">
          <td>{{ age.ageGroup }}-{{ age.ageGroup + 10 }}</td>
          <td>{{ age.count }}</td>
          <td>{{ age.percent }}%</td>
        </tr>
          </tbody>
        </table>
      </div>

    </div>

  </div>
</template>

<script>
import axios from 'axios';
import PersonDetails from './PersonDetails.vue';

export default {
  name: 'CityView',
  components: {
    PersonDetails
  },
  props: {
  },
  data() {
    return {
      url: "http://localhost:3000/",
      citizenCount : "?",
      newestCitizen: {},
      mostRecentCitizens: [],
      neighborhoodStats: {},
      populationAgeDistribution: [],
    }
  },
  methods: {
    getNumCitizens() {
      axios.get(this.url + "citizenCount")
      .then(response => {
        this.citizenCount = response.data;
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
    getPopulationAgeDistribution() {
      axios.get(this.url + "populationAgeDistribution")
      .then(response => {
        this.populationAgeDistribution = response.data;
      })
      .catch(error => {
        console.error(error);
      });
    },
    getNewestCitizen() {
      axios.get(this.url + "newestCitizen")
      .then(response => {
        this.newestCitizen = response.data;
        this.getNumCitizens();
        this.getMostRecentCitizens();
        this.getNeighborhoodStats();
        this.getPopulationAgeDistribution();
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
    this.getNewestCitizen();
    setInterval(() => {
      this.getNewestCitizen();
    }, 10000);
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

.subHeader{
  text-align: left;
}

</style>
