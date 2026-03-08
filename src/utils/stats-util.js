const Stat = require('../dal/models/stat.js');
const logger = require('./logger.js');

async function incrementStat(statKey, friendlyName = null) {
    try {
        const [statRow] = await Stat.findOrCreate({
            where: { stat: statKey },
            defaults: { count: 0, friendly_name: friendlyName || statKey },
        });
        await statRow.increment('count');

        return statRow;
    } catch (err) {
        logger.error(`Failed to increment stat ${statKey}:`, err);
        return null;
    }
}

module.exports = {
    incrementStat,
};
