const Keyword = require('../dal/models/keyword.js');
const logger = require('../utils/logger.js');

async function findAllByType(type, attributes) {
    try {
        return await Keyword.findAll({ raw: true, where: { type }, attributes });
    } catch (err) {
        logger.error(err);
        return [];
    }
}

module.exports = { findAllByType };
