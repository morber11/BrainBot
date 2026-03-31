const ask = require('../../../utils/ask-util.js');
const logger = require('../../../utils/logger.js');

module.exports = async function handleAsking(message) {
    try {
        if (!message.guild) return;

        await ask.chanceToSend(message);
    } catch (err) {
        logger.error(err, {
            guildId: message.guildId,
            channelId: message.channelId,
            messageId: message.id,
            authorId: message.author.id,
            handler: 'handleAsking'
        });
    }
}
