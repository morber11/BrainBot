const mathUtil = require('../../../utils/math-util.js');
const logger = require('../../../utils/logger.js');

module.exports = async function handleInSpace(message) {
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
};
