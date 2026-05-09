const UserStat = require('../dal/models/user-stat.js');
const Stat = require('../dal/models/stat.js');
const logger = require('../utils/logger.js');

async function findAllByUser(userId, attributes = null, order = null) {
    const opts = { raw: true, where: { userId }, attributes, order };
    return UserStat.findAll(opts);
}

async function findOrCreate(userId, statKey, defaults = {}) {
    return UserStat.findOrCreate({ where: { userId, stat: statKey }, defaults });
}

async function findOneByUserAndStat(userId, statKey, options = {}) {
    return UserStat.findOne({ where: { userId, stat: statKey }, ...options });
}

async function updateById(id, attrs) {
    return UserStat.update(attrs, { where: { id } });
}

async function incrementUserStat(userId, statKey, friendlyName = null) {
    try {
        const [row, created] = await findOrCreate(userId, statKey, { count: 0, user_friendly_name: friendlyName || '' });

        if (!created && friendlyName && row.user_friendly_name !== friendlyName) {
            await updateById(row.id, { user_friendly_name: friendlyName });
            row.user_friendly_name = friendlyName;
        }

        await row.increment('count');

        return row;
    } catch (err) {
        logger.error(`Failed to increment user stat ${statKey} for user ${userId}:`, err);
        return null;
    }
}

async function incrementSystemStat(statKey, friendlyName = null, sortOrder = 100) {
    try {
        const [statRow] = await Stat.findOrCreate({
            where: { stat: statKey },
            defaults: { count: 0, friendly_name: friendlyName || statKey, sort_order: sortOrder },
        });

        await statRow.increment('count');

        return statRow;
    } catch (err) {
        logger.error(`Failed to increment system stat ${statKey}:`, err);
        return null;
    }
}

module.exports = {
    findAllByUser,
    findOrCreate,
    findOneByUserAndStat,
    updateById,
    incrementUserStat,
    incrementSystemStat,
};
