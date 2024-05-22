<template>
  <div class="container mt-4">

    <h2 class="mb-4">AI City<small class="popSmall"> - Population: {{citizenCount}}</small></h2> 

    <div class="row">

      <div class="col-8">

        <div v-if="!viewingNeighborhood">
          <AllNeighborhoods :neighborhoodStats="neighborhoodStats" @view="viewNeighborHood" />
        </div>
        <div class="singleNeighborhood" v-else>
          <SingleNeighborhood :url="url" :hoodName="viewingNeighborhood" @back="viewingNeighborhood=false" />
        </div>

      </div>

      <div class="col-4">
        <h4 class="subHeader">Total Population Age Distribution</h4>
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
        <h4 class="subHeader">Most Recent Births</h4>
        <ul>
          <li v-for="(citizen,key) in mostRecentCitizens" :key="key">
            {{ citizen.firstName }} {{ citizen.lastName }} - {{citizen.neighborhood}}
          </li>
        </ul>
      </div>

    </div>

   
    <div class="row">
      <div class="col-12">
        <PersonDetails :person="newestCitizen" />
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import PersonDetails from './PersonDetails.vue';
import SingleNeighborhood from './SingleNeighborhood.vue';
import AllNeighborhoods from './AllNeighborhoods.vue';

export default {
  name: 'CityView',
  components: {
    PersonDetails,
    SingleNeighborhood,
    AllNeighborhoods
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
      viewingNeighborhood: false,
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
    },
    viewNeighborHood(neighborhood) {
      this.viewingNeighborhood = neighborhood;
    }
  },
  computed: {
    // Add your computed properties here
  },
  mounted() {
    this.getNewestCitizen();
    setInterval(() => {
      this.getNewestCitizen();
    }, 1000);
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

.popSmall{
  font-size: 0.75em;
}

.subHeader{
  text-align: left;
}

.container{
  max-width: 90%;
}

</style>