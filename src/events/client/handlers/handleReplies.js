const CONSTANTS = require('../../../utils/constants.js');
const logger = require('../../../utils/logger.js');
const botMessageWindowUtil = require('../../../utils/bot-message-window-util.js');

// reactions to messages sent in the same channel within a minute of brainbot posting
const TRIGGERS = [
    {
        pattern: /\bthank(s| you)\b/,
        respond: (message) => message.react(CONSTANTS.EMOJI.HEART),
    },
];

module.exports = async function handleReplies(message) {
    try {
        if (!botMessageWindowUtil.isOpen(message.channelId)) {
            return;
        }

        const msgContent = message.content.toLowerCase();

        for (const trigger of TRIGGERS) {
            if (trigger.pattern.test(msgContent)) {
                await trigger.respond(message);
            }
        }
    } catch (err) {
        logger.error(err, { handler: 'handleReplies' });
    }
}
