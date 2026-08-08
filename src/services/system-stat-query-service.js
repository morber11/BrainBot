const Stat = require('../dal/models/stat.js');

async function findAll() {
    return Stat.findAll({ order: [['sort_order', 'ASC'], ['count', 'DESC']] });
}

module.exports = { findAll };
