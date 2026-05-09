const CONSTANTS = require('../../../utils/constants.js');
const statService = require('../../../services/system-stat-service.js');
const logger = require('../../../utils/logger.js');

module.exports = async function handleBasicReactResponse(message) {
    try {
        const msgContent = message.content.toLowerCase();

        if (msgContent.includes("brain")) {
            await message.react(CONSTANTS.EMOJI.BRAIN);
            await statService.incrementSystemStat(CONSTANTS.STATS.BRAIN, CONSTANTS.STATS.BRAIN_FRIENDLY);
        }

        if (msgContent.includes(CONSTANTS.EMOJI.BRAIN)) {
            await message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_B);
            await message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_R);
            await message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_A);
            await message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_I);
            await message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_N);
            await statService.incrementSystemStat(CONSTANTS.STATS.BRAIN, CONSTANTS.STATS.BRAIN_FRIENDLY);
        }

        const re = new RegExp("^umm*");
        if (re.test(msgContent))
            await message.react(CONSTANTS.EMOJI.THINKING);

        // we dont need i18n, we only need one spanish word
        if (msgContent.includes("maricon") || msgContent.includes("maricón"))
            await message.react(CONSTANTS.EMOJI.ONE_HUNDRED);

    } catch (err) {
        logger.error(err, {
            guildId: message.guildId,
            channelId: message.channelId,
            messageId: message.id,
            authorId: message.author.id,
            handler: 'handleBasicReactResponse'
        });
    }
}
