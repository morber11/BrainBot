const Reminder = require('../dal/models/reminder.js');

async function createReminder(attrs) {
    return Reminder.create(attrs);
}

async function markAlertsSent(ids) {
    return Reminder.update({ alertSent: true, advanceSendingAt: null }, {
        where: { id: ids, alertSent: false },
    });
}

async function markComplete(ids) {
    return Reminder.update({ complete: true, reminderSendingAt: null }, {
        where: { id: ids, complete: false },
    });
}

async function beginAdvanceSending(id, startedAt) {
    const [updatedCount] = await Reminder.update({ advanceSendingAt: startedAt }, {
        where: { id, alertSent: false, complete: false, advanceSendingAt: null },
    });

    return updatedCount > 0;
}

async function beginReminderSending(id, startedAt) {
    const [updatedCount] = await Reminder.update({ reminderSendingAt: startedAt }, {
        where: { id, complete: false, reminderSendingAt: null },
    });

    return updatedCount > 0;
}

async function releaseAdvanceSending(id, startedAt) {
    return Reminder.update({ advanceSendingAt: null }, {
        where: { id, advanceSendingAt: startedAt },
    });
}

async function releaseReminderSending(id, startedAt) {
    return Reminder.update({ reminderSendingAt: null }, {
        where: { id, reminderSendingAt: startedAt },
    });
}

module.exports = {
    createReminder,
    markAlertsSent,
    markComplete,
    beginAdvanceSending,
    beginReminderSending,
    releaseAdvanceSending,
    releaseReminderSending,
};