const sequelize = require('../database/database.js');
const retryOperation = require('../../utils/retry.js');

async function up() {
    const result = await retryOperation(() => sequelize.query("PRAGMA table_info('stats');"));
    const cols = result && result[0] ? result[0] : [];
    const hasSortOrder = cols.some(c => c && c.name === 'sort_order');

    if (!hasSortOrder) {
        await retryOperation(() => sequelize.query("ALTER TABLE stats ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 1;"));
    }
}

module.exports = { Up: up };
