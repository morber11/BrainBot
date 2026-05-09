const path = require('node:path');
const pathUtility = require('../../../utils/path-util.js');
const CONSTANTS = require('../../../utils/constants.js');
const statService = require('../../../services/system-stat-service.js');
const logger = require('../../../utils/logger.js');

module.exports = async function handleMilk(message) {
    try {
        const msgContent = message.content.toLowerCase();
        if (!(msgContent.includes("milk") || msgContent.includes(CONSTANTS.EMOJI.MILK))) return;

        const dir = pathUtility.getMediaFilePath(path.join(__dirname, '..'), 'audio', 'milk03.mp3');

        await statService.incrementSystemStat(CONSTANTS.STATS.MILK, CONSTANTS.STATS.MILK_FRIENDLY);
        await message.reply({ files: [dir] });
    } catch (err) {
        logger.error(err, { handler: 'handleMilk' });
    }
}
