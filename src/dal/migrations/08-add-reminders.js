const database = require('../database/database.js');

async function Up() {
    await database.query(`
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guildId TEXT,
            channelId TEXT,
            creatorId TEXT NOT NULL,
            userId TEXT NOT NULL,
            remindAt DATETIME NOT NULL,
            alertAt DATETIME NOT NULL,
            alertOffsetMinutes INTEGER NOT NULL DEFAULT 15,
            message TEXT NOT NULL,
            alertSent INTEGER NOT NULL DEFAULT 0,
            complete INTEGER NOT NULL DEFAULT 0,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );
    `);

    await database.query('CREATE INDEX IF NOT EXISTS idx_reminders_remindAt ON reminders(remindAt);');
    await database.query('CREATE INDEX IF NOT EXISTS idx_reminders_alertAt ON reminders(alertAt);');
    await database.query('CREATE INDEX IF NOT EXISTS idx_reminders_userId ON reminders(userId);');
}

module.exports = { Up };
