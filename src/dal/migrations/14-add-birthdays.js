const database = require('../database/database.js');

async function Up() {
    await database.query(`
        CREATE TABLE IF NOT EXISTS birthdays (
            guildId TEXT NOT NULL,
            userId TEXT NOT NULL,
            month INTEGER NOT NULL,
            day INTEGER NOT NULL,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL,
            PRIMARY KEY (guildId, userId)
        );
    `);

    await database.query('CREATE INDEX IF NOT EXISTS idx_birthdays_month_day ON birthdays(month, day);');
}

module.exports = { Up };
