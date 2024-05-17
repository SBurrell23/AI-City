const express = require('express');
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");

// Initialize Express
const app = express();
const port = 3000;

// Initialize Firebase
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
const db = admin.firestore().collection('AI-City');

const neighborhoodNames = [
    "Silverwood Heights",
    "Crystal Cove",
    "Emerald Valley",
    "Whispering Pines",
    "Horizon Hills",
    "Twilight Terrace",
    "Serene Springs",
    "Golden Gate Estates",
    "Maplewood Park",
    "Bluebird Meadows",
    "Starlight Glen",
    "Ravenwood Ridge",
    "Sunset Oaks",
    "Willow Creek",
    "Harmony Harbor",
    "Ivy Lane",
    "Brookstone Village",
    "Copperfield Commons",
    "Pinehurst Point",
    "Evergreen Enclave",
    "Crescent Bay",
    "Meadowbrook Meadows",
    "Falcon's Nest",
    "Coral Reef Cliffs",
    "Lavender Fields"
];

// Middleware to parse JSON bodies
app.use(express.json());

// Define your routes here
app.get('/all', async (req, res) => {
    const querySnapshot = await db.get();
    const citizens = querySnapshot.docs.map(doc => doc.data());
    res.send(citizens); 
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});