const express = require('express');
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.argv[2] });

// Initialize Express
const app = express();
app.use(express.json());
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

// Routes
app.get('/all', async (req, res) => {
    const querySnapshot = await db.get();
    const citizens = querySnapshot.docs.map(doc => doc.data());
    res.send(citizens); 
});

app.get('/createCitizen', async (req, res) => {



    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content:`create a random citizen for my city building game. 
                The citizen is represented by a json object with the following properties:
                {
                    "firstName": "random name starting with the letter '${randChar()}' and ending with the letter '${randChar()}'",
                    "lastName": "random last name starting with the letter '${randChar()}' and ending with the letter '${randChar()}'",
                    "job": "random job starting with the letter '${randChar()}'",
                    "age": random age between 1 - 100,
                    "hobby": "random hobby starting with the letter '${randChar()}'",
                    "favoriteFood": "random food starting with the letter '${randChar()}'"
                }
                Your job is to fill in the properties with crazy but realistic values.
                `
            },
            { role: "user", content: ""},
        ],
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 1.4
    });
    
    var citizen = JSON.parse(completion.choices[0].message.content);
    citizen.neighborhood = neighborhoodNames[Math.floor(Math.random() * neighborhoodNames.length)];
    citizen.born = new Date().toLocaleString();

    console.log(citizen);
    res.send(citizen);

});

function randChar() {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
}
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});