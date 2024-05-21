<template>
  <div v-if="neighborhoodStats.length > 0">
    <div class="row">
      <div class="col-3 mb-2" v-for="(hood,key) in neighborhoodStats" :key="key">
          <div class="card nhCard" :class="{flash: hood.flash}" v-on:click="emitEvent(hood.neighborhood)">
              <div class="card-body">
              <h6 class="card-title"><b>{{ hood.neighborhood }}</b></h6>
              <p class="card-text">Population: {{ hood.count }}</p>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'AllNeighborHoods',
    props: {
        neighborhoodStats: Array
    },
    data() {
        return {
          flash: false,
        };
    },
    watch: {
      neighborhoodStats: {
        handler(newVal, oldVal) {
          newVal.forEach((newHood, index) => {
            if (newHood && oldVal[index] && newHood.count !== oldVal[index].count) {
              newHood.flash = true;
              setTimeout(() => {
                if (newHood) {
                  newHood.flash = false; // Remove the flash class after 1 second
                }
              }, 1000);
            }
          });
        },
        deep: true
      }
    },
    methods: {
        emitEvent(neighborhood) {
            this.$emit('view', neighborhood);
        },
    },
    mounted() {
        
    },
};
</script>

<style scoped>
.nhCard {
  transition: background-color 0.4s ease;
}

.nhCard:hover {
  background-color: rgb(228, 228, 228);
  cursor: pointer;
}

.nhCard:not(:hover) {
  background-color: transparent;
}

.flash {
  animation: flash 1s;
}

@keyframes flash {
  0% { background-color: transparent; }
  50% { background-color: rgb(175, 244, 175); }
  100% { background-color: transparent; }
}

</style>