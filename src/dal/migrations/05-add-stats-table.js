const Stat = require('../models/stat.js');
const retryOperation = require('../../utils/retry.js');
const CONSTANTS = require('../../utils/constants');

async function up() {
    await retryOperation(() =>
        Stat.findOrCreate({
            where: { stat: CONSTANTS.STATS.PATRIOT_ACT },
            defaults: { count: 0, friendly_name: "times i've saluted" },
        })
    );
}

module.exports = { Up: up };
