const Stat = require('../dal/models/stat.js');
const logger = require('../utils/logger.js');

async function incrementSystemStat(statKey, friendlyName = null, sortOrder = 100) {
    try {
        const [statRow] = await Stat.findOrCreate({
            where: { stat: statKey },
            defaults: { count: 0, friendly_name: friendlyName || statKey, sort_order: sortOrder },
        });
        await Stat.increment('count', { where: { id: statRow.id } });
        return statRow;
    } catch (err) {
        logger.error(`Failed to increment system stat ${statKey}:`, err);
        return null;
    }
}

module.exports = { incrementSystemStat };
