const database = require('../database/database.js');

async function Up() {
    const [columns] = await database.query("PRAGMA table_info('polls');");

    if (!columns.some(column => column.name === 'notify')) {
        await database.query('ALTER TABLE polls ADD COLUMN notify INTEGER NOT NULL DEFAULT 1;');
    }
}

module.exports = { Up };
