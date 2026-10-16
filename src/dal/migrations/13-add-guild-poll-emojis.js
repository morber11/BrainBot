const database = require('../database/database.js');

async function Up() {
    const [columns] = await database.query("PRAGMA table_info('guilds');");

    if (!columns.some(column => column.name === 'pollEmojis')) {
        await database.query('ALTER TABLE guilds ADD COLUMN pollEmojis JSON;');
    }
}

module.exports = { Up };
