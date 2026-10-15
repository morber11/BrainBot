const cron = require('cron');
const pollQueryService = require('../../../services/poll/poll-query-service.js');
const pollMessageService = require('../../../services/poll/poll-message-service.js');
const CONSTANTS = require('../../../utils/constants.js');

// runs every 5 minutes. finds open polls ending within the next 5 minutes (or already overdue)
// and gives each one a timer for its exact end time, so it closes on time instead of up to
// 5 minutes late. polls ending further out are skipped for now and picked up by a later run
const onTick = async (client) => {
    const cutoff = new Date(Date.now() + CONSTANTS.POLL.EXPIRY_LOOKAHEAD_MS);
    const polls = await pollQueryService.findPollsEndingBy(cutoff);

    for (const poll of polls) {
        pollMessageService.schedulePollEnd(client, poll);
    }
};

module.exports = (client, tz) => cron.CronJob.from({
    cronTime: CONSTANTS.CRON.POLL_EXPIRY,
    onTick: () => onTick(client),
    start: false,
    waitForCompletion: true,
    timeZone: tz,
});
