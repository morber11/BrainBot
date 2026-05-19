const decrementDespair = require('./cron/decrement-despair-cron');
const patriotAct = require('./cron/patriot-act-cron');
const reminderPoller = require('./cron/reminder-poller');
const debug = require('./cron/debug-cron');
const logger = require('../../utils/logger.js');
const { isValidTimeZone } = require('../../utils/timezone-util.js');
const env = require('../../utils/env.js');

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
        reminderPoller(client, TIMEZONE).start();

        // debug only crons go here
        if (env.isDev) {
            debug(client, TIMEZONE).start();
        }
    };
};
