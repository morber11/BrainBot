const Sequelize = require('sequelize');
const Reminder = require('../dal/models/reminder.js');

async function findAdvanceDueReminders(cutoffTime) {
    return Reminder.findAll({
        raw: true,
        where: {
            alertSent: false,
            complete: false,
            alertAt: { [Sequelize.Op.lte]: cutoffTime },
        },
    });
}

async function findFinalDueReminders(cutoffTime) {
    return Reminder.findAll({
        raw: true,
        where: {
            complete: false,
            remindAt: { [Sequelize.Op.lte]: cutoffTime },
        },
    });
}

module.exports = { findAdvanceDueReminders, findFinalDueReminders };