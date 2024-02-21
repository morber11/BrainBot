const addKeywords = require('../migrations/01-add-initial-keywords.js');
const addUrls = require('../migrations/02-add-initial-urls.js');

async function run() {
    try {
        await Promise.all([addKeywords.Up(), addUrls.Up()]);
        console.log("migrations complete");
    } catch (err) {
        console.error("Error during migrations: ", err);
    }
}

run();