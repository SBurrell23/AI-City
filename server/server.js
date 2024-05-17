const express = require('express');
const cors = require('cors');
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.argv[2] });

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

app.get('/createCitizen', async (req, res) => {
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content:`create a random citizen for my city building game. 
                The citizen is represented by a json object with the following properties:
                {
                    "firstName": "random name ${startOrEnd()} with the letter '${randChar()}'",
                    "lastName": "random last name ${startOrEnd()} with the letter '${randChar()}'",
                    "job": "random job starting with the letter '${randChar()}'",
                    "age": random age between 1 - 100,
                    "hobby": "random hobby starting with the letter '${randChar()}'",
                    "favoriteFood": "random food starting with the letter '${randChar()}'"
                }
                Your job is to fill in the properties with crazy but realistic values.
                Be diverse and creative! Make the jobs and hobbies unique and interesting.
                `
            },
            { role: "user", content: ""},
        ],
        model: "gpt-3.5-turbo-0125",
        response_format: { type: "json_object" },
        temperature: 1.2
    });

    var citizen = trimProperties(JSON.parse(completion.choices[0].message.content));
    citizen.neighborhood = neighborhoodNames[Math.floor(Math.random() * neighborhoodNames.length)];
    citizen.born = new Date().toLocaleString();

    await db.add(citizen); //Wait for the citizen to be added to firestore before returning them.
    console.log("Citizen Born!");
    console.log(citizen);
    res.send(citizen);

});

function startOrEnd() {
    const options = ["starting", "ending"];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
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