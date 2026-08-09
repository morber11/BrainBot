const UserStat = require('../dal/models/user-stat.js');

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

module.exports = {
    findAllByUser,
    findOrCreate,
    findOneByUserAndStat,
    updateById,
};
