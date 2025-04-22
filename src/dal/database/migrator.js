const addKeywords = require('../migrations/01-add-initial-keywords.js');
const addUrls = require('../migrations/02-add-initial-urls.js');
const addNewUrls = require('../migrations/03-add-new-urls.js');

async function run() {
    try {
        await Promise.all([addKeywords.Up(), addUrls.Up(), addNewUrls.Up()]);
        console.log("migrations complete");
    } catch (err) {
        console.error("Error during migrations: ", err);
    }
}

run();