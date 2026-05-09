const CONSTANTS = require('../../../utils/constants.js');
const userStatService = require('../../../services/user-stat-service.js');
const logger = require('../../../utils/logger.js');
const responseWindowUtil = require('../../../utils/response-window-util.js');

module.exports = async (message) => {
    try {
        if (!message.guild) {
            return;
        }

        if (!responseWindowUtil.isActive(message.guild.id)) {
            return;
        }

        const content = (message.content || '').trim().toLowerCase();
        const hasSaluteText = content === 'o7';
        const hasSaluteEmoji =
            content.includes(CONSTANTS.EMOJI.SALUTE) ||
            content.includes(CONSTANTS.EMOJI.SALUTE_EMOJI);

        if (!hasSaluteText && !hasSaluteEmoji) {
            return;
        }

        if (!responseWindowUtil.shouldCount(message.guild.id, message.author.id)) {
            return;
        }

        await userStatService.incrementUserStat(
            message.author.id,
            CONSTANTS.STATS.SALUTES_GIVEN,
            CONSTANTS.STATS.SALUTES_GIVEN_FRIENDLY
        );
    } catch (error) {
        logger.error('Error handling patriot salute:', error);
    }
};
