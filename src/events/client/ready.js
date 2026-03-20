const logger = require('../../utils/logger.js');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        logger.info(`Bot is running: ${client.user.tag}`);
    }
}