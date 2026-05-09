const CustomUrl = require('../dal/models/custom-url.js');
const logger = require('../utils/logger.js');

async function findAllByType(type, attributes) {
    try {
        return await CustomUrl.findAll({ raw: true, where: { type }, attributes });
    } catch (err) {
        logger.error(err);
        return [];
    }
}

// this will only return url, nothing else
// hence why we sometimes use findAllByType
// when we need specific details such as the value
async function getUrls(type) {
    return findAllByType(type, ['url']);
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
