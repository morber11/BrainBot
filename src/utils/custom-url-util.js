const CustomUrl = require('../dal/models/custom-url.js');

exports.getUrls = async function(type) {
    try {
        const urls = await CustomUrl.findAll({
            attributes: ['url'],
            where: { type: type },
            raw: true
        });
        return urls;
    } catch (error) {
        console.error(error);
        return [];
    }
}