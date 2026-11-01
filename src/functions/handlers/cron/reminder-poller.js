const cron = require('cron');
const reminderQueryService = require('../../../services/reminder-query-service.js');
const reminderMessageService = require('../../../services/reminder-message-service.js');
const CONSTANTS = require('../../../utils/constants.js');

const onTick = async (client) => {
    const cutoff = new Date(Date.now() + CONSTANTS.REMINDER.LOOKAHEAD_MS);

    const advanceReminders = await reminderQueryService.findAdvanceDueReminders(cutoff);
    for (const reminder of advanceReminders) {
        reminderMessageService.scheduleAlert(client, reminder);
    }

    const finalReminders = await reminderQueryService.findFinalDueReminders(cutoff);
    for (const reminder of finalReminders) {
        reminderMessageService.scheduleReminder(client, reminder);
    }
};

module.exports = (client, tz) => cron.CronJob.from({
    cronTime: CONSTANTS.CRON.REMINDER_POLL,
    onTick: () => onTick(client),
    start: false,
    waitForCompletion: true,
    timeZone: tz,
});
