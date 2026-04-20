const CONSTANTS = require('../../utils/constants.js');
const statsUtil = require('../../utils/stats-util.js');
const logger = require('../../utils/logger.js');
const responseWindowUtil = require('../../utils/response-window-util.js');

function isSaluteEmoji(emoji) {
    return (
        emoji === CONSTANTS.EMOJI.SALUTE ||
        emoji === CONSTANTS.EMOJI.SALUTE_EMOJI ||
        emoji === 'saluting_face'
    );
}

async function handlePatriotReaction(reaction, user) {
    if (!reaction || !user || user.bot) {
        return;
    }

    const message = reaction.message;
    if (!message || !message.guild) {
        return;
    }

    if (!responseWindowUtil.isActive(message.guild.id)) {
        return;
    }

    const emoji = reaction.emoji && reaction.emoji.name;
    if (!isSaluteEmoji(emoji)) {
        return;
    }

    if (!responseWindowUtil.shouldCount(message.guild.id, user.id)) {
        return;
    }

    await statsUtil.incrementUserStat(
        user.id,
        CONSTANTS.STATS.SALUTES_GIVEN,
        CONSTANTS.STATS.SALUTES_GIVEN_FRIENDLY
    );
}

const handlers = [handlePatriotReaction];

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        try {
            for (const handler of handlers) {
                await handler(reaction, user);
            }
        } catch (error) {
            logger.error('Error handling patriot reaction:', error);
        }
    }
};
