const mathUtil = require('../../../utils/math-util.js');
const statService = require('../../../services/system-stat-service.js');
const logger = require('../../../utils/logger.js');
const CONSTANTS = require('../../../utils/constants.js');
const env = require('../../../utils/env.js');

const lastMissTheRageByGuild = new Map();
const MISS_THE_RAGE_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const missTheRageRegex = /\bi miss\s+(\S+)/;

module.exports = async function handleMarioJudah(message) {
    try {
        const msgContent = message.content.toLowerCase();

        const match = msgContent.match(missTheRageRegex);

        if (!match) return;

        const guildKey = message.guildId || `dm:${message.author.id}`;

        if (!env.isDev) {
            const last = lastMissTheRageByGuild.get(guildKey) || 0;
            if (Date.now() - last < MISS_THE_RAGE_COOLDOWN_MS) return;
        }

        const chance = env.isDev ? 100 : 20;
        if (!env.isDev && mathUtil.getRandomInt(100) >= chance) return;

        lastMissTheRageByGuild.set(guildKey, Date.now());

        await statService.incrementSystemStat(CONSTANTS.STATS.MARIO_JUDAH_MISS_THE_RAGE, CONSTANTS.STATS.MARIO_JUDAH_MISS_THE_RAGE_FRIENDLY);
        await message.reply('i miss the rage');
    } catch (err) {
        logger.error(err, {
            guildId: message.guildId,
            channelId: message.channelId,
            messageId: message.id,
            authorId: message.author?.id,
            handler: 'handleMarioJudah'
        });
    }
}
