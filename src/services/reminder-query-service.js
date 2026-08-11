const Sequelize = require('sequelize');
const Reminder = require('../dal/models/reminder.js');

async function findAdvanceDueReminders(cutoffTime) {
    return Reminder.findAll({
        raw: true,
        where: {
            alertSent: false,
            complete: false,
            advanceSendingAt: { [Sequelize.Op.is]: null },
            alertAt: { [Sequelize.Op.lte]: cutoffTime },
        },
    });
}

async function findFinalDueReminders(cutoffTime) {
    return Reminder.findAll({
        raw: true,
        where: {
            complete: false,
            reminderSendingAt: { [Sequelize.Op.is]: null },
            remindAt: { [Sequelize.Op.lte]: cutoffTime },
        },
    });
}

module.exports = { findAdvanceDueReminders, findFinalDueReminders };