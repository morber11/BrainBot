const statService = require('./system-stat-service.js');
const CONSTANTS = require('../utils/constants.js');
const logger = require('../utils/logger.js');

const LONG_MESSAGE_THRESHOLD = 70;

// statements
const LEADING_QUESTION_WORD_REGEX = /^(?:what|who|whom|whose|which|where|when|why|how)\b/i;
const LEADING_AUX_VERB_REGEX = /^(?:do|does|did|is|are|am|was|were|can|could|will|would|should|shall|may|might|must|have|has|had)\b/i;
// catches question words in the middle of sentences
const QUESTION_WORD_PLUS_AUX_REGEX = /\b(?:what|who|whom|whose|which|where|when|why|how)\s+(?:do|does|did|is|are|am|was|were|can|could|will|would|should|shall|may|might|must|have|has|had)\b/i;
const LEADING_MENTION_REGEX = /^(?:@\S+|<\S+>)\s*/g;

function isQuestion(content) {
    // ignore leading @mentions
    const withoutMentions = content.trim().replace(LEADING_MENTION_REGEX, '');

    return withoutMentions.endsWith('?')
        || LEADING_QUESTION_WORD_REGEX.test(withoutMentions)
        || LEADING_AUX_VERB_REGEX.test(withoutMentions)
        || QUESTION_WORD_PLUS_AUX_REGEX.test(withoutMentions);
}

function getAskText(messageOrInteraction) {
    const original = (messageOrInteraction && (
        messageOrInteraction.content ||
        (messageOrInteraction.message && messageOrInteraction.message.content) ||
        ''
    ) || '');
    const content = original.toLowerCase();

    if (content.includes("i didn't ask")) return null;
    if (isQuestion(content)) return null;

    const trimmed = original.trim();
    const isLong = trimmed.length > LONG_MESSAGE_THRESHOLD;
    const match = original.match(/^\s*i\s+\S+([\s\S]*)$/i);
    const isLeading = Boolean(match);
    const isKeyword = content.includes('ask') || content.includes('i did');


    if (!(isLong || isLeading || isKeyword)) return "i didn't ask";

    const optionalCount = (isLong ? 1 : 0) + (isLeading ? 1 : 0);
    const baseWeight = 100 - (optionalCount * 10);
    const roll = Math.floor(Math.random() * 100);

    if (roll < baseWeight) return "i didn't ask";

    let remainderRoll = roll - baseWeight;
    if (isLong) {
        if (remainderRoll < 10) return "that's a lot of words to not ask";
        remainderRoll -= 10;
    }

    if (isLeading) {
        if (remainderRoll < 10) {
            const remainder = match[1] || '';
            return "i didn't ask" + remainder;
        }
        remainderRoll -= 10; // not really neeeded but in case we want to extend later
    }

    return "i didn't ask";
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
