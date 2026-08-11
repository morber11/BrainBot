const cron = require('cron');
const reminderCommandService = require('../../../services/reminder-command-service.js');
const reminderQueryService = require('../../../services/reminder-query-service.js');
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

async function processReminders({ client, reminders, beginSending, complete, release, isAdvance, errorMessage }) {
    for (const reminder of reminders) {
        const claimedAt = new Date();
        try {
            const claimed = await beginSending(reminder.id, claimedAt);
            if (!claimed) continue;

            await sendReminder(client, reminder, isAdvance);
            await complete([reminder.id]);
        } catch (err) {
            await release(reminder.id, claimedAt);
            logger.error(errorMessage, { reminderId: reminder.id, err });
        }
    }
}

const onTick = async (client) => {
    const now = new Date();

    const advanceReminders = await reminderQueryService.findAdvanceDueReminders(now);
    
    await processReminders({
        client,
        reminders: advanceReminders,
        beginSending: reminderCommandService.beginAdvanceSending,
        complete: reminderCommandService.markAlertsSent,
        release: reminderCommandService.releaseAdvanceSending,
        isAdvance: true,
        errorMessage: 'Failed to send advance reminder',
    });

    const finalReminders = await reminderQueryService.findFinalDueReminders(now);
    await processReminders({
        client,
        reminders: finalReminders,
        beginSending: reminderCommandService.beginReminderSending,
        complete: reminderCommandService.markComplete,
        release: reminderCommandService.releaseReminderSending,
        isAdvance: false,
        errorMessage: 'Failed to send final reminder',
    });
};

module.exports = (client, tz) => cron.CronJob.from({
    cronTime: CONSTANTS.CRON.REMINDER_POLL,
    onTick: () => onTick(client, tz),
    start: false,
    waitForCompletion: true,
    timeZone: tz,
});
