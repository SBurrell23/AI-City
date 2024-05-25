<template>
    <div class="card">
        <h3 class="card-header">
            {{ hoodName}}
        </h3>
        <div class="card-body" v-if="details != null">

            <h4>Statistics</h4>
            <ul>
            <li>Total People: {{ details.stats.total_people }}</li>
            <li>Average Age: {{ details.stats.avg_age }}</li>
            <li>Max Age: {{ details.stats.max_age }}</li>
            <li>Percent of Total Population: {{ details.stats.percent_of_total_population }}%</li>
            </ul>
            
           <!-- need to display the rest of the details data next -->

   
            <button class="btn btn-primary btn-sm backButton" @click="$emit('back')"> Back To City</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'SingleNeighborhood',
    props: {
        hoodName: String,
        url: String
    },
    data() {
        return {
            details: null,
        };
    },
    methods: {
        getNeighborhoodDetails() {
            this.details = null;
            axios.get(this.url + "neighborhoodDetails/?name=" + this.hoodName)
            .then(response => {
                console.log(response.data);
                this.details = response.data;
            })
            .catch(error => {
                console.error(error);
            });
        }
    },
    mounted() {
        this.getNeighborhoodDetails();
    }
}
</script>

<style scoped>

.backButton{
    position: absolute;
    top: 8px;
    left: 10px;
}

</style>