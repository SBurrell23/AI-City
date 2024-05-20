<!-- src/components/PersonDetails.vue -->
<template>
    <div class="mt-5" v-if="person.id">

    <div class ="row">
        <div class="col-4">
            <h4 class="mb-4">Newest Person</h4>
            <table class="table table-sm table-bordered">
            <thead class="thead-dark">
            <tr>
                <th>Attribute</th>
                <th>Details</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>ID</td>
                <td>{{ person.id }}</td>
            </tr>
            <tr>
                <td>First Name</td>
                <td>{{ person.firstName }}</td>
            </tr>
            <tr>
                <td>Last Name</td>
                <td>{{ person.lastName }}</td>
            </tr>
            <tr>
                <td>Job</td>
                <td>{{ person.job }}</td>
            </tr>
            <tr>
                <td>Age</td>
                <td>{{ person.age }}</td>
            </tr>
            <tr>
                <td>Favorite Food</td>
                <td>{{ person.favoriteFood }}</td>
            </tr>
            <tr>
                <td>Favorite Hobby</td>
                <td>{{ person.favoriteHobby }}</td>
            </tr>
            <tr>
                <td>Neighborhood</td>
                <td>{{ person.neighborhood }}</td>
            </tr>
            <tr>
                <td>Born</td>
                <td>{{ person.born }}</td>
            </tr>
            <tr>
                <td>Personality</td>
                <td>{{ person.personality }}</td>
            </tr>
            <tr>
                <td>Country</td>
                <td>{{ person.country }}</td>
            </tr>
            </tbody>
            </table>
        </div>
        <div class="col-4">
            <h4 class="mb-4">Parent A Details</h4>
            <table class="table table-sm table-bordered">
            <thead class="thead-dark">
            <tr>
                <th>Attribute</th>
                <th>Details</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>ID</td>
                <td>{{ person.parentA.id }}</td>
            </tr>
            <tr>
                <td>First Name</td>
                <td>{{ person.parentA.firstName }}</td>
            </tr>
            <tr>
                <td>Last Name</td>
                <td>{{ person.parentA.lastName }}</td>
            </tr>
            <tr>
                <td>Job</td>
                <td>{{ person.parentA.job }}</td>
            </tr>
            <tr>
                <td>Age</td>
                <td>{{ person.parentA.age }}</td>
            </tr>
            <tr>
                <td>Favorite Food</td>
                <td>{{ person.parentA.favoriteFood }}</td>
            </tr>
            <tr>
                <td>Favorite Hobby</td>
                <td>{{ person.parentA.favoriteHobby }}</td>
            </tr>
            <tr>
                <td>Neighborhood</td>
                <td>{{ person.parentA.neighborhood }}</td>
            </tr>
            <tr>
                <td>Born</td>
                <td>{{ person.parentA.born }}</td>
            </tr>
            <tr>
                <td>Personality</td>
                <td>{{ person.parentA.personality }}</td>
            </tr>
            <tr>
                <td>Country</td>
                <td>{{ person.parentA.country }}</td>
            </tr>
            </tbody>
            </table>
        </div>
        <div class="col-4">
            <h4 class="mb-4">Parent B Details</h4>
            <table class="table table-sm table-bordered">
            <thead class="thead-dark">
            <tr>
            <th>Attribute</th>
            <th>Details</th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>ID</td>
            <td>{{ person.parentB.id }}</td>
            </tr>
            <tr>
            <td>First Name</td>
            <td>{{ person.parentB.firstName }}</td>
            </tr>
            <tr>
            <td>Last Name</td>
            <td>{{ person.parentB.lastName }}</td>
            </tr>
            <tr>
            <td>Job</td>
            <td>{{ person.parentB.job }}</td>
            </tr>
            <tr>
            <td>Age</td>
            <td>{{ person.parentB.age }}</td>
            </tr>
            <tr>
            <td>Favorite Food</td>
            <td>{{ person.parentB.favoriteFood }}</td>
            </tr>
            <tr>
            <td>Favorite Hobby</td>
            <td>{{ person.parentB.favoriteHobby }}</td>
            </tr>
            <tr>
            <td>Neighborhood</td>
            <td>{{ person.parentB.neighborhood }}</td>
            </tr>
            <tr>
            <td>Born</td>
            <td>{{ person.parentB.born }}</td>
            </tr>
            <tr>
            <td>Personality</td>
            <td>{{ person.parentB.personality }}</td>
            </tr>
            <tr>
            <td>Country</td>
            <td>{{ person.parentB.country }}</td>
            </tr>
            </tbody>
            </table>
        </div>
    </div>


    </div>
  </template>
  
  <script>
  export default {
    name: 'PersonDetails',
    props: {
        person: Object
    },
    data() {
      return {
      };
    }
  };
  </script>
  
  <style scoped>
  .table thead th {
    background-color: #343a40;
    color: #ffffff;
  }
  </style>
  