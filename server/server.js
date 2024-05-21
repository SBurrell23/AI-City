require('dotenv').config({ path: './sql.env' });
const express = require('express'); 
const cors = require('cors');
const mysql = require('mysql2');
const moment = require('moment-timezone');

const OpenAI = require('openai');  
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});

const jobs = require('./jobs.json');
const firstNames = require('./firstNames.json');
const lastNames = require('./lastNames.json');
const countries = require('./countries.json');
const personalities = require('./personalities.json');
const { sleep } = require('openai/core');

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
        connection.query('SELECT COUNT(*) AS total_records FROM `AI-City`.`people`', (err, result) => {
            connection.release();
            if (err) {
                res.send("Error executing query: " + err);
            } else {
                const count = result[0].total_records.toString();
                res.send(count);
            }
        });
    });
});

app.get('/populationAgeDistribution', async (req, res) => {
    connectionPool.getConnection((err, connection) => {
        connection.query(`
        SELECT
            FLOOR(age / 10) * 10 AS ageGroup,
            COUNT(*) AS count,
            COUNT(*) / (
            SELECT
            COUNT(*)
            FROM
            \`AI-City\`.\`people\`) * 100 AS percent
        FROM
            \`AI-City\`.\`people\`
        GROUP BY
            ageGroup
        ORDER BY
            ageGroup DESC;
        `, (err, result) => {
            connection.release();
            if (err) {
                res.send("Error executing query: " + err);
            } else {
                res.send(result);
            }
        });
    });
});

app.get('/mostRecentCitizens', async (req, res) => {
    connectionPool.getConnection((err, connection) => {
        connection.query('SELECT * FROM people ORDER BY born DESC LIMIT 5', (err, result) => {
            connection.release();
            if (err) {
                res.send("Error executing query: " + err);
            } else {
                res.send(result);
            }
        });
    });
});

app.get('/newestCitizen', async (req, res) => {
    connectionPool.getConnection((err, connection) => {
        if (err) {
            res.send("Error getting connection: " + err);
        } else {
            connection.query('SELECT * FROM people WHERE age = 0 ORDER BY born DESC LIMIT 1', (err, result) => {
                connection.release();
                if (err) {
                    res.send("Error executing query: " + err);
                } else {
                    var newestCitizen = result[0];
                    const parentA = newestCitizen.parentA;
                    const parentB = newestCitizen.parentB;
                    connectionPool.getConnection((err, connection) => {
                        connection.query('SELECT * FROM people WHERE id = ? OR id = ?;',[parentA,parentB], (err, result) => {
                            connection.release();
                            if (err) {
                                res.send("Error executing query: " + err);
                            } else {
                                newestCitizen.parentA = result[0];
                                newestCitizen.parentB = result[1];
                                res.send(newestCitizen);
                            }
                        });
                    });
                }
            });
        }
    });
});

app.get('/neighborhoodStats', async (req, res) => { 
    connectionPool.getConnection((err, connection) => {
        connection.query('SELECT neighborhood, COUNT(*) AS count FROM people GROUP BY neighborhood', (err, result) => {
            connection.release();
            if (err) {
                res.send("Error executing query: " + err);
            } else {
                res.send(result);
            }
        });
    });
});

app.get('/createStartingCitizens', async (req, res) => {
    neighborhoodNames.forEach(neighborhood => {
        for (let i = 0; i < 10; i++) {
            createStartingCitizens(req,res,neighborhood,i);
        }
    });
});

birthNewCitizen();
setInterval(birthNewCitizen, 10000); 

async function birthNewCitizen(){
    const randomNeighborhood = getRandomNeighborhood();  
    connectionPool.getConnection((err, connection) => {
        if (err) {
            console.log("Error getting connection: " + err);
        } else {
            connection.query('SELECT * FROM people WHERE neighborhood = ? AND age >= 20 AND age <= 50 ORDER BY RAND() LIMIT 2', [randomNeighborhood], (err, result) => {
                connection.release();
                if (err) {
                    console.log("Error executing query: " + err);
                } else {
                    var twoParents = result;
                    //console.log(twoParents);
                    createNewCitizen(twoParents);
                }
            });
        }
    });
}

async function createNewCitizen(twoParents){
    const prompt = `I need you to create a new citizen for my AI city game.
    Here are the two parent objects: ${JSON.stringify(twoParents[0])} and ${JSON.stringify(twoParents[1])}.
    You need to create a new citizen json object that is a combination of the two parents.
    It's age should be 0, and it should have a random favoriteFood and favoriteHobby that makes sense based on its parents.
    It's job should be something related to its parents jobs.
    It should have no greater then 5 personality traits!!!
    The first name should be a new completely random name.
    It's last name should be one word that is a portmanteau of the parents last names but be no longer than 12 characters.
    The output should be a json object with the same keys as it's parents.
    Return ONLY the json object and nothing extra.
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
        var baby = trimProperties(JSON.parse(text));
    } catch (error) {
        console.error("Error parsing baby JSON:", error);
       return;
    }
    baby.neighborhood = twoParents[0].neighborhood;
    baby.country = twoParents[0].country;
    baby.born = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    baby.parentA = twoParents[0].id;
    baby.parentB = twoParents[1].id;
    const capitalizeFirstLetter = name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    baby.firstName = capitalizeFirstLetter(baby.firstName);
    baby.lastName = capitalizeFirstLetter(baby.lastName);
    const truncateAtHyphen = str => str.includes('-') ? str.substring(0, str.indexOf('-')) : str;
    baby.firstName = truncateAtHyphen(baby.firstName);
    baby.age = 0;
    baby = removeHallucinations(baby);
   
    //console.log(baby);

    //All citizens age by 1 year and a new baby is born
    ageNeighboorhoodHandleDeathsAndCreateBaby(twoParents[0].neighborhood,baby);
}

function ageNeighboorhoodHandleDeathsAndCreateBaby(neighborhood, baby) {
        // 10% chance to age everyone in the neighborhood
        // This is to help keep the populations higher and prevent them from aging an dying out too quickly
        if (Math.random() < 0.10) { 
            connectionPool.getConnection((err, connection) => {
                connection.query('UPDATE people SET age = age + 1 WHERE neighborhood = ?', [neighborhood], (err, result) => {
                    connection.release();
                    if (err) {
                        console.log("Error executing query: " + err);
                    } else {
                        //After we age everyone, handles deaths (create baby after)
                        console.log(`Aged ${result.affectedRows} people in ${neighborhood}`);
                        handleDeaths(neighborhood, baby);
                    }
                });
            });
        } else {
            // If nobody aged, nobody dies, just add the baby
            console.log("Nobody aged this round..");
            addBaby(neighborhood, baby);
        }
}

function handleDeaths(neighborhood,baby){
    connectionPool.getConnection((err, connection) => {
        connection.query('SELECT id, age FROM people WHERE neighborhood = ? AND age > 60 ',[neighborhood], (err, result) => {
            connection.release();
            console.log("Rolling Death Dice");
            //console.log(result);
            const idsToDelete = result.filter(person => {
                const randNum = Math.random();
                if (person.age > 100) {
                    return randNum < 0.5; // 1/2 chance every year for 100+ year olds
                } else if (person.age > 90) {
                    return randNum < 0.20; // 1/5 chance every year for 90+ year olds
                } else if (person.age > 80) {
                    return randNum < 0.05; // 1/20  chance every year for 80+ year olds
                } else if (person.age > 70) {
                    return randNum < 0.034; // 1/30 chance every year for 70+ year olds
                }else if (person.age > 60) {
                    return randNum < 0.025; // 1/40 chance every year for 60+ year olds
                }
                return false;
            }).map(person => person.id);

            if (idsToDelete.length > 0) {
                connectionPool.getConnection((err, connection) => {
                    connection.query('DELETE FROM people WHERE id IN (?) AND neighborhood = ?', [idsToDelete, neighborhood], (err, result) => {
                        connection.release();
                        if (err) {
                            console.log("Error executing query: " + err);
                        } else {
                            console.log(`${result.affectedRows} people over age 60 died in ${neighborhood}`);
                            // After the old people die, we finally birth the baby
                            addBaby(neighborhood, baby);
                        }
                    });
                });
            } else{
                // Nobody died??? Just add the baby
                console.log("Nobody died today!!!");
                addBaby(neighborhood, baby);
            }
        });
    });
}

function addBaby(neighborhood,baby) {
    connectionPool.getConnection((err, connection) => {
        connection.query('INSERT INTO people SET ?', baby, (err, result) => { 
            connection.release();
            if (err) {
                console.log("Error executing query: " + err);
                connection.release();
            } else {
                console.log(`New baby born in ${neighborhood} \n`);
                //console.log(result);
            }
        });
    });
}

async function createStartingCitizens(req,res,neighborhood,index) {
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
                    "age": "20",
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
    citizen.neighborhood = neighborhood;
    citizen.born = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    citizen.parentA = null;
    citizen.parentB = null;
    citizen = removeHallucinations(citizen);

    addCitizenToDatabase(citizen);
    sleep(1000);
}

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

// This is actualyl a bell curve distribution to vary the neighborhood populations
function getRandomNeighborhood(){
    const mean = (neighborhoodNames.length - 1) / 2;

    // Adjust this value to change the spread of the distribution
    // Lower values will shallow the curve, higher values will make it more steep (2-5 is a good range)
    const stdDev = neighborhoodNames.length / 5; 
    let u1 = Math.random();
    let u2 = Math.random();
    let randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2); 
    let randNormal = mean + stdDev * randStdNormal; 
    
    let index = Math.round(randNormal);
    index = Math.max(0, index);
    index = Math.min(neighborhoodNames.length - 1, index); 
    
    return neighborhoodNames[index];
    //return neighborhoodNames[Math.floor(Math.random() * neighborhoodNames.length)]; 
}

//Trim all string properties to 250 characters in case of odd ai behavior
function trimProperties(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].substring(0, 250);
        }
    }
    return obj;
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});