const CONSTANTS = require('../../utils/constants.js');
const logger = require('../../utils/logger.js');
const responseWindowUtil = require('../../utils/response-window-util.js');

const DEFAULT_BOT_NAME = 'brainbot';

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isThanksToBot(msgContent, botName) {
    const names = [DEFAULT_BOT_NAME];

    if (botName) {
        names.unshift(botName.toLowerCase());
    }

    return names.some((name) => new RegExp(`\\bthank(s| you)\\s+${escapeRegex(name)}(?!\\w)`).test(msgContent));
}

const TRIGGERS = [
    {
        matches: (msgContent, message) => isThanksToBot(msgContent, message.guild?.members.me.displayName),
        respond: (message) => message.react(CONSTANTS.EMOJI.HEART),
    },
];

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        try {
            if (message.author.id === message.client.user.id) {
                responseWindowUtil.start(CONSTANTS.RESPONSE_WINDOW.REPLY, message.channelId, 60000);
                return;
            }

            if (message.author.bot || !responseWindowUtil.isActive(CONSTANTS.RESPONSE_WINDOW.REPLY, message.channelId)) {
                return;
            }

            const msgContent = message.content.toLowerCase();

            for (const trigger of TRIGGERS) {
                if (trigger.matches(msgContent, message)) {
                    await trigger.respond(message);
                }
            }
        } catch (err) {
            logger.error(err, { handler: 'messageReplies' });
        }
    }
}
