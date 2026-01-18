const FactOrFiction = require('../models/fact-or-fiction.js');
const retryOperation = require('../../utils/retry.js');

const factOrFictionEntry = [
    { value: 'fact', entryHash: '6865f6b409b1e10c0c2c1a349271d2e88330b32f0fcefce16825a1c0513f2a27' }, // https://en.wikipedia.org/wiki/Beyond_Belief:_Fact_or_Fiction
];


async function up() {
    for (const obj of factOrFictionEntry) {
        await retryOperation(() =>
            FactOrFiction.findOrCreate({
                where: {
                    value: obj.value,
                    entryHash: obj.entryHash,
                }
            })
        );
    }
}

module.exports = { Up: up }