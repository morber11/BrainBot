const Guild = require('../../dal/models/guild.js');

async function getPollEmojiIds(guildId) {
    const guild = await Guild.findByPk(guildId);

    return guild?.pollEmojis ?? null;
}

async function setPollEmojiIds(guildId, emojiIds) {
    return Guild.upsert({ id: guildId, pollEmojis: emojiIds });
}

async function getUsableEmojis(guild) {
    const serverEmojis = await guild.emojis.fetch();

    return serverEmojis.filter(emoji => emoji.available && emoji.roles.cache.size === 0);
}

module.exports = { getPollEmojiIds, setPollEmojiIds, getUsableEmojis };
