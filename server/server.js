require('dotenv').config({ path: './sql.env' });
const express = require('express'); 
const cors = require('cors');
const mysql = require('mysql2');
const moment = require('moment-timezone');
const OpenAI = require('openai');  
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const jobs = require('./jobs.json');
const firstNames = require('./firstNames.json');
const lastNames = require('./lastNames.json');
const countries = require('./countries.json');
const personalities = require('./personalities.json');

// Initialize Express
const app = express();
app.use(express.json()); 
const port = 3000;
app.use(cors()); //Adjust this for production

// MySQL Connection Pool
const connectionPool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 500  
}); 

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
    connectionPool.getConnection((err, connection) => {
        if (err) {
            res.send("Error getting connection from pool");
            return;
        }
        connection.ping((err) => {
            connection.release();
            if (err) {
                res.send("Ping error: " + err);
            } else {
                res.send("Database ping successful");
            }
        });
    });
});

app.get('/citizenCount', async (req, res) => {
    connectionPool.getConnection((err, connection) => {
        if (err) {
            res.send("Error getting connection: " + err);
        } else {
            connection.query('SELECT COUNT(*) AS count FROM people', (err, result) => {
                connection.release();
                if (err) {
                    res.send("Error executing query: " + err);
                } else {
                    const count = result[0].count;
                    res.send(count.toString());
                }
            });
        }
    });
});

app.get('/mostRecentCitizens', async (req, res) => {
    connectionPool.getConnection((err, connection) => {
        if (err) {
            res.send("Error getting connection: " + err);
        } else {
            connection.query('SELECT * FROM people ORDER BY born DESC LIMIT 10', (err, result) => {
                connection.release();
                if (err) {
                    res.send("Error executing query: " + err);
                } else {
                    res.send(result);
                }
            });
        }
    });
});

app.get('/neighborhoodStats', async (req, res) => { 
    connectionPool.getConnection((err, connection) => {
        if (err) {
            res.send("Error getting connection: " + err);
        } else {
            connection.query('SELECT neighborhood, COUNT(*) AS count FROM people GROUP BY neighborhood', (err, result) => {
                connection.release();
                if (err) {
                    res.send("Error executing query: " + err);
                } else {
                    res.send(result);
                }
            });
        }
    });
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
                    "personality": "${getRandomPersonality()}",
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
    citizen.neighborhood = neighborhoodNames[Math.floor(Math.random() * neighborhoodNames.length)];
    citizen.born = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    citizen.parentA = null;
    citizen.parentB = null;
    citizen = removeHallucinations(citizen);

    connectionPool.getConnection((err, connection) => {
        if (err) {
            res.send("Error getting connection: " + err);
        } else {
            const query = 'INSERT INTO people SET ?';
            connection.query(query, citizen, (err, result) => {
                connection.release();
                if (err) {
                    res.send("Error executing query: " + err);
                } else {
                    console.log("Citizen Born!");
                    console.log(citizen);
                    res.send(citizen);
                    //res.send(result);
                }
            });
        }
    });
});

function removeHallucinations(obj) {
    var validKeys = [
        "firstName", 
        "lastName", 
        "job", 
        "age", 
        "favoriteFood", 
        "favoriteHobby",
        "neighborhood",
        "born",
        "parentA",
        "parentB",
        "personality", 
        "country"
    ];
    for (let key in obj) {
        if (!validKeys.includes(key)) {
            delete obj[key];
        }
    }
    return obj;
}

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

function getRandomPersonality(){
    const randomIndex = Math.floor(Math.random() * personalities.length);
    return personalities[randomIndex];
}

function randomAge() {
    return Math.floor(Math.random() * (100 - 16 + 1) + 16);
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