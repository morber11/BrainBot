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

async function findOrCreate(attrs) {
    return Keyword.findOrCreate({ where: { name: attrs.name, type: attrs.type }, defaults: attrs });
}

async function create(attrs) {
    return Keyword.create(attrs);
}

module.exports = { findAllByType, findOrCreate, create };
