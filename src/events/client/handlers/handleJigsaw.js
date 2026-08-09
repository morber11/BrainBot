const path = require('node:path');
const pathUtility = require('../../../utils/path-util.js');
const CONSTANTS = require('../../../utils/constants.js');
const statService = require('../../../services/system-stat-command-service.js');
const logger = require('../../../utils/logger.js');

module.exports = async function handleJigsaw(message) {
    try {
        const msgContent = message.content.toLowerCase();
        if (!msgContent.includes("make your choice")) return;

        const dir = pathUtility.getMediaFilePath(path.join(__dirname, '..'), 'images', 'jigsaw/jigsaw.jpg');

        await statService.incrementSystemStat(CONSTANTS.STATS.JIGSAW, CONSTANTS.STATS.JIGSAW_FRIENDLY);
        await message.reply({ files: [dir] });
    } catch (err) {
        logger.error(err, { handler: 'handleJigsaw' });
    }
}
