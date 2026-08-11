const UserStat = require('../dal/models/user-stat.js');

async function findAll(userId, order = null) {
    return UserStat.findAll({ raw: true, where: { userId }, attributes: null, order });
}

module.exports = { findAll };
