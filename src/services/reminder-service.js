const Sequelize = require('sequelize');
const Reminder = require('../dal/models/reminder.js');

async function createReminder(attrs) {
    return Reminder.create(attrs);
}

async function findAdvanceDueReminders(cutoffTime) {
    return Reminder.findAll({
        raw: true,
        where: {
            alertSent: false,
            complete: false,
            alertAt: {
                [Sequelize.Op.lte]: cutoffTime,
            },
        },
    });
}

async function findFinalDueReminders(cutoffTime) {
    return Reminder.findAll({
        raw: true,
        where: {
            complete: false,
            remindAt: {
                [Sequelize.Op.lte]: cutoffTime,
            },
        },
    });
}

async function markAlertsSent(ids) {
    return Reminder.update({ alertSent: true }, {
        where: {
            id: ids,
            alertSent: false,
        },
    });
}

async function markComplete(ids) {
    return Reminder.update({ complete: true }, {
        where: {
            id: ids,
            complete: false,
        },
    });
}

module.exports = {
    createReminder,
    findAdvanceDueReminders,
    findFinalDueReminders,
    markAlertsSent,
    markComplete,
};
