const database = require('./database.js');
require('../models/guild.js');
require('../models/member.js');
require('../models/keyword.js');
require('../models/custom-url.js');
require('../models/fact-or-fiction.js');
require('../models/stat.js');
const logger = require('../../utils/logger.js');

logger.info('beginning sync');

async function syncDatabase() {
    try {
        await database.sync({ force: true });
        logger.info('done');
    } catch (err) {
        logger.error('An error occurred:', err);
    }
}

syncDatabase();