const { RESTJSONErrorCodes } = require('discord.js');
const reminderCommandService = require('./reminder-command-service.js');
const CONSTANTS = require('../utils/constants.js');
const logger = require('../utils/logger.js');

const scheduledTimers = new Set();

async function send(client, reminder, text) {
    if (reminder.channelId) {
        const channel = await client.channels.fetch(reminder.channelId);
        await channel.send(text);

        return;
    }

    const user = await client.users.fetch(reminder.userId);
    await user.send(text);
}

async function sendAlert(client, reminder) {
    const claimedAt = new Date();

    try {
        const claimed = await reminderCommandService.beginAdvanceSending(reminder.id, claimedAt);
        if (!claimed) {
            return;
        }

        const text = `Reminder in ${reminder.alertOffsetMinutes} minutes for <@${reminder.userId}>: ${reminder.message}`;
        await send(client, reminder, text);

        await reminderCommandService.markAlertsSent([reminder.id]);
    } catch (err) {
        if (err.code === RESTJSONErrorCodes.UnknownChannel) {
            await reminderCommandService.markComplete([reminder.id]);
            logger.warn('reminder channel no longer exists, marking reminder complete', { reminderId: reminder.id });
            return;
        }

        await reminderCommandService.releaseAdvanceSending(reminder.id, claimedAt);
        logger.error('failed to send advance reminder', { reminderId: reminder.id, err });
    }
}

async function sendReminder(client, reminder) {
    const claimedAt = new Date();

    try {
        const claimed = await reminderCommandService.beginReminderSending(reminder.id, claimedAt);
        if (!claimed) {
            return;
        }

        const text = `Reminder for <@${reminder.userId}>: ${reminder.message}`;
        await send(client, reminder, text);

        await reminderCommandService.markComplete([reminder.id]);
    } catch (err) {
        if (err.code === RESTJSONErrorCodes.UnknownChannel) {
            await reminderCommandService.markComplete([reminder.id]);
            logger.warn('reminder channel no longer exists, marking reminder complete', { reminderId: reminder.id });
            return;
        }

        await reminderCommandService.releaseReminderSending(reminder.id, claimedAt);
        logger.error('failed to send final reminder', { reminderId: reminder.id, err });
    }
}

function runAt(timerId, dueAt, task) {
    if (scheduledTimers.has(timerId)) {
        return;
    }

    const delay = dueAt.getTime() - Date.now();
    if (delay > CONSTANTS.REMINDER.LOOKAHEAD_MS) {
        return;
    }

    scheduledTimers.add(timerId);

    setTimeout(async () => {
        try {
            await task();
        } catch (err) {
            logger.error('failed to send reminder', { timerId, err });
        } finally {
            scheduledTimers.delete(timerId);
        }
    }, Math.max(delay, 0));
}

function scheduleAlert(client, reminder) {
    runAt(`alert-${reminder.id}`, reminder.alertAt, () => sendAlert(client, reminder));
}

function scheduleReminder(client, reminder) {
    runAt(`reminder-${reminder.id}`, reminder.remindAt, () => sendReminder(client, reminder));
}

module.exports = { scheduleAlert, scheduleReminder };
