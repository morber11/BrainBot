const path = require('node:path');
const pathUtility = require('../../../utils/path-util.js');
const CONSTANTS = require('../../../utils/constants.js');
const userStatService = require('../../../services/user-stat-service.js');
const logger = require('../../../utils/logger.js');

const lastRavenByGuild = new Map();

module.exports = async function handleRaven(message) {
    try {
        const msgContent = message.content.toLowerCase();
        if (!msgContent.includes("lost a life")) return;

        const ravenImages = ['raven-1.gif', 'raven-2.gif', 'raven-3.gif'];

        const guildKey = message.guildId || 'dm';
        const lastForGuild = lastRavenByGuild.get(guildKey);

        const choices = lastForGuild ? ravenImages.filter(img => img !== lastForGuild) : ravenImages;
        const selection = choices[Math.floor(Math.random() * choices.length)];

        lastRavenByGuild.set(guildKey, selection);

        const dir = pathUtility.getMediaFilePath(path.join(__dirname, '..'), 'images', selection);

        await userStatService.incrementSystemStat(CONSTANTS.STATS.RAVEN, CONSTANTS.STATS.RAVEN_FRIENDLY);
        await message.reply({ files: [dir] });

    } catch (err) {
        logger.error(err, { handler: 'handleRaven' });
    }
}
