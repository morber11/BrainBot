const database = require('../database/database.js');

async function Up() {
    const [columns] = await database.query("PRAGMA table_info('reminders');");

    if (!columns.some(column => column.name === 'advanceSendingAt')) {
        await database.query('ALTER TABLE reminders ADD COLUMN advanceSendingAt DATETIME;');
    }

    if (!columns.some(column => column.name === 'reminderSendingAt')) {
        await database.query('ALTER TABLE reminders ADD COLUMN reminderSendingAt DATETIME;');
    }
}

module.exports = { Up };