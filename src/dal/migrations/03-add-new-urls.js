const CustomUrl = require('../models/custom-url.js');
const retryOperation = require('../../utils/retry.js');

const urls = [
    { type: 'meditate', value: '1', url: 'https://www.youtube.com/watch?v=q89AUqvqLPo' },
];


async function up() {
    for (const obj of urls) {
        await retryOperation(() =>
            CustomUrl.findOrCreate({
                where: {
                    value: obj.value,
                    url: obj.url,
                    type: obj.type
                }
            })
        );
    }
}


module.exports = { Up: up }