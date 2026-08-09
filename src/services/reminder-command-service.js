const Reminder = require('../dal/models/reminder.js');

async function createReminder(attrs) {
    return Reminder.create(attrs);
}

async function markAlertsSent(ids) {
    return Reminder.update({ alertSent: true }, {
        where: { id: ids, alertSent: false },
    });
}

async function markComplete(ids) {
    return Reminder.update({ complete: true }, {
        where: { id: ids, complete: false },
    });
}

module.exports = { createReminder, markAlertsSent, markComplete };