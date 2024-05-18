const express = require('express');
const moment = require('moment-timezone');
const cors = require('cors');
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.argv[2] });

const jobs = require('./jobs.json');
const firstNames = require('./firstNames.json');
const lastNames = require('./lastNames.json');
const countries = require('./countries.json');




// Initialize Express
const app = express();
app.use(express.json());
const port = 3000;
app.use(cors()); //Adjust this for production

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
app.get('/ping', (req, res) => {
    res.send('Pong!');
});

app.get('/citizenCount', async (req, res) => {
    const snapshot = await db.get();
    res.send({ count: snapshot.size });
});

app.get('/mostRecentCitizens', async (req, res) => {
    const snapshot = await db.orderBy('born', 'desc').limit(10).get();
    const citizens = [];
    snapshot.forEach(doc => {
        citizens.push(doc.data());
    });
    res.send(citizens);
});

app.get('/neighborhoodStats', async (req, res) => {
    const neighborhoodInfo = [];
    for (const neighborhood of neighborhoodNames) {
        const snapshot = await db.where('neighborhood', '==', neighborhood).get();
        neighborhoodInfo.push({ neighborhood, count: snapshot.size });
    }
    neighborhoodInfo.sort((a, b) => a.neighborhood.localeCompare(b.neighborhood)); // Sort by neighborhood key
    res.send(neighborhoodInfo);
});

app.get('/createCitizen', async (req, res) => {
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content:`create a random citizen for my city building game. 
                The citizen is represented by a json object with the following properties:
                {
                    "firstName": "${getRandomFirstName()}",
                    "lastName": "${getRandomLastName()}",
                    "job": "${getRandomJob()}",
                    "age": "${randomAge()}",
                    "country": "${getRandomCountry()}",
                    "favoriteFood": "",
                    "favoriteHobby": "",
                }
                Your job is to fill in the favoriteFood and favoriteHobby with the thing you think would make sense based on the job, name, age and country.
                `
            },
            { role: "user", content: ""},
        ],
        model: "gpt-3.5-turbo-0125",
        response_format: { type: "json_object" },
        temperature: 1.2
    });

    var citizen = trimProperties(JSON.parse(completion.choices[0].message.content));
    delete citizen.country;
    citizen.neighborhood = neighborhoodNames[Math.floor(Math.random() * neighborhoodNames.length)];
    citizen.born = admin.firestore.Timestamp.fromDate(new Date());

    await db.add(citizen); //Wait for the citizen to be added to firestore before returning them.
    console.log("Citizen Born!");
    console.log(citizen);
    res.send(citizen);

});

function getRandomJob(){
    const randomIndex = Math.floor(Math.random() * jobs.length);
    return jobs[randomIndex];
}

function getRandomFirstName(){
    const randomIndex = Math.floor(Math.random() * firstNames.length);
    return firstNames[randomIndex];
}

function getRandomLastName(){
    const randomIndex = Math.floor(Math.random() * lastNames.length);
    return lastNames[randomIndex];
}

function getRandomCountry(){
    const randomIndex = Math.floor(Math.random() * countries.length);
    return countries[randomIndex];
}

function randomAge() {
    return Math.floor(Math.random() * (100 - 16 + 1) + 16);
}

function randChar() {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
}

//Trim all string properties to 100 characters in case of odd ai behavior
function trimProperties(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].substring(0, 100);
        }
    }
    return obj;
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});