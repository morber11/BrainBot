const CONSTANTS = require('../../utils/constants.js');
const userStatCommandService = require('../../services/user-stat-command-service.js');
const pollMessageService = require('../../services/poll/poll-message-service.js');
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

    if (!responseWindowUtil.isActive(CONSTANTS.RESPONSE_WINDOW.SALUTE, message.guild.id)) {
        return;
    }

    const emoji = reaction.emoji && reaction.emoji.name;
    if (!isSaluteEmoji(emoji)) {
        return;
    }

    if (!responseWindowUtil.shouldCount(CONSTANTS.RESPONSE_WINDOW.SALUTE, message.guild.id, user.id)) {
        return;
    }

    await userStatCommandService.incrementUserStat(
        user.id,
        CONSTANTS.STATS.SALUTES_GIVEN,
        CONSTANTS.STATS.SALUTES_GIVEN_FRIENDLY
    );
}

// bit of YAGNI but in case we want to add further ones later, they can exist as
// separate handlers
// single choice goes first so each user's latest pick is recorded in the order reactions arrive
// can probably be wired up later to some handler to send it to the appropriate one
// instead of being passed to everything but no real benefit right now
const handlers = [
    pollMessageService.handleSingleChoice,
    pollMessageService.handlePollReaction,
    handlePatriotReaction
];

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        try {
            for (const handler of handlers) {
                await handler(reaction, user);
            }
        } catch (error) {
            logger.error('error handling reaction:', error);
        }
    }
};
