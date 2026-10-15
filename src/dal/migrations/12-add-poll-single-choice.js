const database = require('../database/database.js');

async function Up() {
    const [columns] = await database.query("PRAGMA table_info('polls');");

    if (!columns.some(column => column.name === 'singleChoice')) {
        await database.query('ALTER TABLE polls ADD COLUMN singleChoice INTEGER NOT NULL DEFAULT 0;');
    }
}

module.exports = { Up };
