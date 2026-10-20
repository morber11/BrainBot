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

module.exports = { findAllByType, getUrls };
