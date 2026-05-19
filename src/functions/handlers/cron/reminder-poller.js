const cron = require('cron');
const reminderService = require('../../../services/reminder-service.js');
const CONSTANTS = require('../../../utils/constants.js');
const logger = require('../../../utils/logger.js');

async function sendReminder(client, reminder, isAdvance) {
    const text = isAdvance
        ? `Reminder in ${reminder.alertOffsetMinutes} minutes for <@${reminder.userId}>: ${reminder.message}`
        : `Reminder for <@${reminder.userId}>: ${reminder.message}`;

    if (reminder.channelId) {
        const channel = await client.channels.fetch(reminder.channelId);
        await channel.send(text);

        return;
    }

    const user = await client.users.fetch(reminder.userId);
    await user.send(text);
}

const onTick = async (client) => {
    const now = new Date();

    const advanceReminders = await reminderService.findAdvanceDueReminders(now);
    // not sure if i like this being 2 try/catches
    // but the service has no try/catch and that seems overkill
    for (const reminder of advanceReminders) {
        try {
            await sendReminder(client, reminder, true);
            await reminderService.markAlertsSent([reminder.id]);
        } catch (err) {
            logger.error('Failed to send advance reminder', { reminderId: reminder.id, err });
        }
    }

    const finalReminders = await reminderService.findFinalDueReminders(now);
    for (const reminder of finalReminders) {
        try {
            await sendReminder(client, reminder, false);
            await reminderService.markComplete([reminder.id]);
        } catch (err) {
            logger.error('Failed to send final reminder', { reminderId: reminder.id, err });
        }
    }
};

module.exports = (client, tz) => cron.CronJob.from({
    cronTime: CONSTANTS.CRON.REMINDER_POLL,
    onTick: () => onTick(client, tz),
    start: false,
    waitForCompletion: true,
    timeZone: tz,
});
