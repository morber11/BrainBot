const Stat = require('../dal/models/stat.js');
const logger = require('../utils/logger.js');

async function findOrCreate(statKey, defaults = {}) {
    return Stat.findOrCreate({ where: { stat: statKey }, defaults });
}

async function incrementSystemStat(statKey, friendlyName = null, sortOrder = 100) {
    try {
        const [statRow] = await findOrCreate(statKey, { count: 0, friendly_name: friendlyName || statKey, sort_order: sortOrder });
        await statRow.increment('count');
        return statRow;
    } catch (err) {
        logger.error(`Failed to increment system stat ${statKey}:`, err);
        return null;
    }
}

module.exports = { findOrCreate, incrementSystemStat };
