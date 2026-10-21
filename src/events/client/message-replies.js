const CONSTANTS = require('../../utils/constants.js');
const logger = require('../../utils/logger.js');
const responseWindowUtil = require('../../utils/response-window-util.js');

const TRIGGERS = [
    {
        pattern: /\bthank(s| you)\b/,
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
                if (trigger.pattern.test(msgContent)) {
                    await trigger.respond(message);
                }
            }
        } catch (err) {
            logger.error(err, { handler: 'messageReplies' });
        }
    }
}
