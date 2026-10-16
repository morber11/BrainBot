const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const pollEmojiService = require('../../services/poll/poll-emoji-service.js');

const SET_SUBCOMMAND = 'set';
const CLEAR_SUBCOMMAND = 'clear';
const SHOW_SUBCOMMAND = 'show';
const EMOJIS_OPTION = 'emojis';

// matches <:name:id> or <a:name:id> (picked from the emoji menu) and :name: (typed)
const EMOJI_PATTERN = /<a?:(\w+):(\d{17,20})>|:(\w+):/g;

function formatEmojiList(emojis) {
    return emojis.map((emoji, i) => `${i + 1}. ${emoji}`).join('\n');
}

// emojis the bot can use are kept in order (repeats once), everything else is skipped
function parseEmojiList(text, usableEmojis) {
    const emojis = [];
    const skipped = text.replace(EMOJI_PATTERN, ' ').split(/\s+/).filter(Boolean);

    for (const [token, , id, typedName] of text.matchAll(EMOJI_PATTERN)) {
        const emoji = id
            ? usableEmojis.get(id)
            : usableEmojis.find(serverEmoji => serverEmoji.name === typedName);

        if (!emoji) {
            skipped.push(token);
        } else if (!emojis.includes(emoji)) {
            emojis.push(emoji);
        }
    }

    return { emojis, skipped };
}

async function setEmojis(interaction) {
    const usableEmojis = await pollEmojiService.getUsableEmojis(interaction.guild);
    const { emojis, skipped } = parseEmojiList(interaction.options.getString(EMOJIS_OPTION), usableEmojis);

    if (emojis.length === 0) {
        await interaction.reply({
            content: 'None of those are custom emojis from this server that the bot can use',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    await pollEmojiService.setPollEmojiIds(interaction.guildId, emojis.map(emoji => emoji.id));

    let content = `Polls will use these emojis, in answer order:\n${formatEmojiList(emojis)}`;

    if (skipped.length > 0) {
        content += `\n\nSkipped (not custom emojis from this server the bot can use): ${skipped.join(' ')}`;
    }

    await interaction.reply({ content, flags: MessageFlags.Ephemeral });
}

async function clearEmojis(interaction) {
    await pollEmojiService.setPollEmojiIds(interaction.guildId, null);

    await interaction.reply({
        content: 'Poll emojis cleared, polls will use random server emojis again',
        flags: MessageFlags.Ephemeral,
    });
}

async function showEmojis(interaction) {
    const emojiIds = await pollEmojiService.getPollEmojiIds(interaction.guildId) ?? [];
    const usableEmojis = await pollEmojiService.getUsableEmojis(interaction.guild);
    const emojis = emojiIds.map(id => usableEmojis.get(id)).filter(Boolean);

    if (emojis.length === 0) {
        await interaction.reply({
            content: 'No poll emojis are set, polls use random server emojis',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    await interaction.reply({
        content: `Polls use these emojis, in answer order:\n${formatEmojiList(emojis)}`,
        flags: MessageFlags.Ephemeral,
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voteemojis')
        .setDescription('Choose which custom emojis polls use')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand => subcommand
            .setName(SET_SUBCOMMAND)
            .setDescription('Set the emojis polls use, in answer order')
            .addStringOption(option => option
                .setName(EMOJIS_OPTION)
                .setDescription('Custom emojis in order, e.g. :first: :second:')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName(CLEAR_SUBCOMMAND)
            .setDescription('Go back to random server emojis'))
        .addSubcommand(subcommand => subcommand
            .setName(SHOW_SUBCOMMAND)
            .setDescription('Show the emojis polls use')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === SET_SUBCOMMAND) {
            await setEmojis(interaction);
        } else if (subcommand === CLEAR_SUBCOMMAND) {
            await clearEmojis(interaction);
        } else {
            await showEmojis(interaction);
        }
    },
};
