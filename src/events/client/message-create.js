const fs = require('node:fs');
const path = require('node:path');
const pathUtility = require('../../utils/path-util.js');
const CONSTANTS = require('../../utils/constants.js');
const Member = require('../../dal/models/member.js');
const Keyword = require('../../dal/models/keyword.js');
const CustomUrl = require('../../dal/models/custom-url.js');
const stringUtility = require('../../utils/string-util.js');
const logger = require('../../utils/logger.js');
const mathUtil = require('../../utils/math-util.js');
const statsUtil = require('../../utils/stats-util.js');
const handleAsking = require('./handlers/handleAsking');
const handleBasicReactResponse = require('./handlers/handleBasicReactResponse');
const handleMilk = require('./handlers/handleMilk');
const handleJigsaw = require('./handlers/handleJigsaw');
const handleRaven = require('./handlers/handleRaven');
const handleMentalDespair = require('./handlers/handleMentalDespair');
const handleInSpace = require('./handlers/handleInSpace');
const handleMarioJudah = require('./handlers/handleMarioJudah');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) {
            return;
        }

        const handlers = [
            handleBasicReactResponse,
            handleMilk,
            handleJigsaw,
            handleRaven,
            handleMentalDespair,
            handleAsking,
            handleInSpace,
            handleMarioJudah,
        ];

        for (const handler of handlers) {
            await handler(message);
        }
    }
}
