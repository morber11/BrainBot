const database = require('./database.js');
const Guild = require('../models/guild.js');
const Member = require('../models/member.js');
const Keyword = require('../models/keyword.js');
const CustomUrl = require('../models/custom-url.js');

console.log("beginning sync");

async function syncDatabase() {
    try {
        await database.sync({force: true});
        console.log("done");
    } catch(err) {
        console.error("An error occurred: ", err);
    }
}

syncDatabase();