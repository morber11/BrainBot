const CustomUrl = require('../dal/models/custom-url.js');
const logger = require('../utils/logger.js');

async function findAllByType(type, attributes) {
    return CustomUrl.findAll({ raw: true, where: { type }, attributes });
}

async function getUrls(type) {
    try {
        return await findAllByType(type, ['url']);
    } catch (err) {
        logger.error(err);
        return [];
    }
}

async function findRandomUrl(type) {
    const urls = await findAllByType(type);
    return urls[Math.floor(Math.random() * urls.length)];
}

async function findOrCreateUrl(attrs) {
    return CustomUrl.findOrCreate({ where: { value: attrs.value, type: attrs.type }, defaults: attrs });
}

async function createUrl(attrs) {
    return CustomUrl.create(attrs);
}

module.exports = { findAllByType, getUrls, findRandomUrl, findOrCreateUrl, createUrl };
