const CustomUrl = require('../dal/models/custom-url.js');

async function findAllByType(type, attributes) {
    return CustomUrl.findAll({ raw: true, where: { type }, attributes });
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

module.exports = { findAllByType, findRandomUrl, findOrCreateUrl, createUrl };
