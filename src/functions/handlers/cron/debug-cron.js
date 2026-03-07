const cron = require('cron');
const CONSTANTS = require('../../../utils/constants.js');
const logger = require('../../../utils/logger.js');

const debug = (client) => new cron.CronJob(CONSTANTS.CRON.DEBUG, async () => {
    try {
        // this has backticks, single quotes AND double quotes!
        for (const guild of client.guilds.cache.values()) {
            logger.info(`Guild: ${guild.name}`);
            logger.info("Channels in the guild:");
            logger.info(guild.channels.cache.map(ch => ch.name).join(', '));      
        }
    } catch (error) {
        logger.error('Error while fetching servers or sending messages:', error);
    }
});

module.exports = debug;
