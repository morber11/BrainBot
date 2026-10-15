const database = require('../database/database.js');

async function Up() {
    await database.query(`
        CREATE TABLE IF NOT EXISTS polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guildId TEXT NOT NULL,
            channelId TEXT NOT NULL,
            messageId TEXT NOT NULL UNIQUE,
            creatorId TEXT NOT NULL,
            question TEXT NOT NULL,
            options JSON NOT NULL,
            endsAt DATETIME NOT NULL,
            ended INTEGER NOT NULL DEFAULT 0,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );
    `);

    await database.query('CREATE INDEX IF NOT EXISTS idx_polls_endsAt ON polls(endsAt);');
}

module.exports = { Up };
