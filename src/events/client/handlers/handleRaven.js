const path = require('node:path');
const pathUtility = require('../../../utils/path-util.js');
const stringUtility = require('../../../utils/string-util.js');
const CONSTANTS = require('../../../utils/constants.js');
const statService = require('../../../services/system-stat-command-service.js');
const logger = require('../../../utils/logger.js');

const lastRavenByGuild = new Map();

module.exports = async function handleRaven(message) {
    try {
        const msgContent = message.content.toLowerCase();
        if (!msgContent.includes("lost a life")) return;

        const ravenImages = ['raven/raven-1.gif', 'raven/raven-2.gif', 'raven/raven-3.gif'];

        const guildKey = message.guildId || 'dm';
        const lastForGuild = lastRavenByGuild.get(guildKey);

        const choices = lastForGuild ? ravenImages.filter(img => img !== lastForGuild) : ravenImages;
        const selection = stringUtility.selectRandomFromArray(choices);

        lastRavenByGuild.set(guildKey, selection);

        const imgPath = pathUtility.getMediaFilePath(path.join(__dirname, '..'), 'images', selection);

        await statService.incrementSystemStat(CONSTANTS.STATS.RAVEN, CONSTANTS.STATS.RAVEN_FRIENDLY);
        await message.reply({ files: [imgPath] });

    } catch (err) {
        logger.error(err, { handler: 'handleRaven' });
    }
}
