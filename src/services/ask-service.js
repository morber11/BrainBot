const statService = require('./system-stat-service.js');
const askResponseService = require('./ask-response-service.js');
const CONSTANTS = require('../utils/constants.js');
const logger = require('../utils/logger.js');

function getAskText(messageOrInteraction) {
    const original = (messageOrInteraction && (
        messageOrInteraction.content ||
        (messageOrInteraction.message && messageOrInteraction.message.content) ||
        ''
    ) || '');
    const roll = Math.floor(Math.random() * 100);
    const result = askResponseService.evaluateAskResponse({ content: original, roll });

    return result.replyText;
}

//const COOLDOWN_MS = 1000 // debug
const COOLDOWN_MS = 48 * 60 * 60 * 1000;
const CHANCE = 20000;

const cooldownGuilds = new Set();
// similar logic used in message-create event
// consisder making more generic later
const lastTriggerTimestamps = new Map();

function shouldReply(guildId) {
    const now = Date.now();

    if (cooldownGuilds.has(guildId)) {
        const last = lastTriggerTimestamps.get(guildId) || 0;
        if (now - last < COOLDOWN_MS) return false;
        cooldownGuilds.delete(guildId);
    }

    if (Math.floor(Math.random() * CHANCE) === 0) {
        cooldownGuilds.add(guildId);
        lastTriggerTimestamps.set(guildId, now);
        return true;
    }

    return false;
}

async function chanceToSend(messageOrInteraction) {
    const guildId = messageOrInteraction.guildId || (messageOrInteraction.guild && messageOrInteraction.guild.id);
    if (!guildId) return false;

    if (!shouldReply(guildId)) return false;

    try {
        await statService.incrementSystemStat(CONSTANTS.STATS.DIDNT_ASK, CONSTANTS.STATS.DIDNT_ASK_FRIENDLY, 1);

        const text = getAskText(messageOrInteraction);
        if (!text) return false;
        await messageOrInteraction.reply(text);

        return true;
    } catch (err) {
        logger.error('Failed to send "i didn\'t ask" reply:', err);
        return false;
    }
}

async function forceSend(messageOrInteraction) {
    try {
        await statService.incrementSystemStat(CONSTANTS.STATS.DIDNT_ASK, CONSTANTS.STATS.DIDNT_ASK_FRIENDLY, 1);
        const text = getAskText(messageOrInteraction);
        await messageOrInteraction.reply(text);

        return true;
    } catch (err) {
        logger.error('Failed to force-send "i didn\'t ask" reply:', err);
        return false;
    }
}

module.exports = {
    COOLDOWN_MS,
    CHANCE,
    cooldownGuilds,
    lastTriggerTimestamps,
    shouldReply,
    chanceToSend,
    forceSend,
    getAskText,
};
