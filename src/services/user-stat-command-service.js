const UserStat = require('../dal/models/user-stat.js');
const logger = require('../utils/logger.js');

async function incrementUserStat(userId, statKey, friendlyName = null) {
    try {
        const [row, created] = await UserStat.findOrCreate({
            where: { userId, stat: statKey },
            defaults: { count: 0, user_friendly_name: friendlyName || '' },
        });

        if (!created && friendlyName && row.user_friendly_name !== friendlyName) {
            await UserStat.update({ user_friendly_name: friendlyName }, { where: { id: row.id } });
            row.user_friendly_name = friendlyName;
        }

        await row.increment('count');

        return row;
    } catch (err) {
        logger.error(`Failed to increment user stat ${statKey} for user ${userId}:`, err);
        return null;
    }
}

module.exports = { incrementUserStat };
