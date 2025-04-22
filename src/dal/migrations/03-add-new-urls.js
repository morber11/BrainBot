const CustomUrl = require('../models/custom-url.js');

const urls = [
    { type: 'meditate', value: '1', url: 'https://www.youtube.com/watch?v=q89AUqvqLPo' },
];

async function up() {
    await Promise.all(urls.map(obj => 
        CustomUrl.findOrCreate({
            where: {
                value: obj.value,
                url: obj.url,
                type: obj.type
            }
        })
    ));
}

module.exports = { Up: up }