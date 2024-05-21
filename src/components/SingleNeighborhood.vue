<template>
    <div class="card">
        <h3 class="card-header">
            {{ hoodName}}
        </h3>
        <div class="card-body">
            <h5 class="card-title">Neghboord speicific stats go here</h5>
            <p class="card-text">
                things like...
            </p>
            <button class="btn btn-primary backButton" @click="$emit('back')"> &#8592; Back</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SingleNeighborhood',
    props: {
        hoodName: String
    },
    data() {
        return {
        };
    },
    methods: {
    },
    mounted() {
    }
}
</script>

<style scoped>

.backButton{
    float:left;
}

</style>