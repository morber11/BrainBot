const cron = require('cron');
const CONSTANTS = require('../../../utils/constants.js');

const debug = (client) => new cron.CronJob(CONSTANTS.CRON.DEBUG, async () => {
    try {
        // this has backticks, single quotes AND double quotes!
        for (const guild of client.guilds.cache.values()) {
            console.log(`Guild: ${guild.name}`);
            console.log("Channels in the guild:");
            console.log(guild.channels.cache.map(ch => ch.name).join(', '));      
        }
    } catch (error) {
        console.error('Error while fetching servers or sending messages:', error);
    }
});

module.exports = debug;
