const decrementDespair = require('./cron/decrement-despair-cron');
const patriotAct = require('./cron/patriot-act-cron');
const debug = require('./cron/debug-cron');
const logger = require('../../utils/logger.js');
const { isValidTimeZone } = require('../../utils/timezone-util.js');

module.exports = (client) => {
    client.handleCrons = async () => {

        const candidateTZ = process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone || 'GMT';
        let TIMEZONE = candidateTZ;

        if (!isValidTimeZone(TIMEZONE)) {
            logger.warn(`Invalid timezone '${TIMEZONE}' specified; defaulting to GMT`);
            TIMEZONE = 'GMT';
        }

        decrementDespair.start();
        patriotAct(client, TIMEZONE).start();

        // debug only crons go here
        if (process.env.NODE_ENV === 'development') {
            debug(client, TIMEZONE).start();
        }
    };
};
