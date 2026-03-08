const sequelize = require('../database/database.js');
const retryOperation = require('../../utils/retry.js');
const CONSTANTS = require('../../utils/constants');

async function up() {
    await retryOperation(async () => {
        const selectSql = "SELECT id FROM stats WHERE stat = ? LIMIT 1;";
        const inserts = await sequelize.query(selectSql, { replacements: [CONSTANTS.STATS.PATRIOT_ACT] });
        const rows = inserts && inserts[0] ? inserts[0] : [];
        if (!rows || rows.length === 0) {
            const insertSql = "INSERT INTO stats (stat, count, friendly_name, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'));";
            await sequelize.query(insertSql, { replacements: [CONSTANTS.STATS.PATRIOT_ACT, 0, "times i've saluted"] });
        }
    });
}

module.exports = { Up: up };
