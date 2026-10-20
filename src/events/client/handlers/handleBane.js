const path = require('node:path');
const pathUtility = require('../../../utils/path-util.js');
const mathUtil = require('../../../utils/math-util.js');
const statService = require('../../../services/system-stat-command-service.js');
const logger = require('../../../utils/logger.js');
const CONSTANTS = require('../../../utils/constants.js');
const env = require('../../../utils/env.js');

const lastBaneByGuild = new Map();
const BANE_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const BANE_CHANCE_PERCENT = 50;

module.exports = async function handleBane(message) {
    try {
        const msgContent = message.content.toLowerCase();

        if (!msgContent.includes("tell me about bane")) return;

        const guildKey = message.guildId || `dm:${message.author.id}`;

        if (!env.isDev) {
            const last = lastBaneByGuild.get(guildKey) || 0;
            if (Date.now() - last < BANE_COOLDOWN_MS) return;
        }

        if (!env.isDev && mathUtil.getRandomInt(100) >= BANE_CHANCE_PERCENT) return;

        lastBaneByGuild.set(guildKey, Date.now());

        const imgPath = pathUtility.getMediaFilePath(path.join(__dirname, '..'), 'images', 'bane/bane.jpeg');

        await statService.incrementSystemStat(CONSTANTS.STATS.BANE, CONSTANTS.STATS.BANE_FRIENDLY);
        await message.reply({ files: [imgPath] });
    } catch (err) {
        logger.error(err, {
            guildId: message.guildId,
            channelId: message.channelId,
            messageId: message.id,
            authorId: message.author?.id,
            handler: 'handleBane'
        });
    }
}
