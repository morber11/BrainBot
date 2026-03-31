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
const handleMarioJudah = require('./handlers/handleMarioJudah');

// similar logic used in ask-util
// consisder making more generic later

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) {
            return;
        }

        // some of these rely on msg content (for example - what guild they are in) 
        // so we'll handle .toLowerCase() inside the handlers
        // consider changing later
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





async function handleInSpace(message) {
    try {
        const msgContent = message.content.toLowerCase();

        if (!msgContent.includes('in space')) return;

        const count = mathUtil.getRandomInt(6) + 5;
        const phrase = 'in space no one can hear you in space';
        const response = Array(count).fill(phrase).join(' ');

        await message.reply(response);
    } catch (err) {
        logger.error(err, { handler: 'handleInSpace' });
    }
}


