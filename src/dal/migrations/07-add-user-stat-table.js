const sequelize = require('../database/database.js');
const retryOperation = require('../../utils/retry.js');

async function up() {
    await retryOperation(async () => {
        const exists = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='user_stat';");
        const rows = exists && exists[0] ? exists[0] : [];
        if (!rows || rows.length === 0) {
            const createSql = `CREATE TABLE user_stat (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                stat TEXT NOT NULL,
                user_friendly_name TEXT DEFAULT '',
                count INTEGER NOT NULL DEFAULT 0,
                createdAt TEXT,
                updatedAt TEXT
            );`;
            await sequelize.query(createSql);
            await sequelize.query("CREATE UNIQUE INDEX IF NOT EXISTS ux_user_stat_user_stat ON user_stat (userId, stat);");
        }
    });
}

module.exports = { Up: up };
