const Stat = require('../models/stat.js');
const retryOperation = require('../../utils/retry.js');
const CONSTANTS = require('../../utils/constants');

async function up() {
    await Stat.sync();

    await retryOperation(() =>
        Stat.findOrCreate({
            where: { stat: CONSTANTS.STATS.PATRIOT_ACT },
            defaults: { count: 0 },
        })
    );
}

module.exports = { Up: up };
