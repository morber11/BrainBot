const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const pollCommandService = require('../../services/poll/poll-command-service.js');
const pollEmojiService = require('../../services/poll/poll-emoji-service.js');
const voteForm = require('./vote-form.js');
const pollHelper = require('../../services/poll/poll-helper.js');
const pollMessageService = require('../../services/poll/poll-message-service.js');
const reminderHelper = require('../../services/reminder-helper.js');
const CONSTANTS = require('../../utils/constants.js');

function getEndsAt(expiresIn, now) {
    if (!expiresIn) {
        return new Date(now.getTime() + CONSTANTS.POLL.DEFAULT_DURATION_HOURS * 60 * 60 * 1000);
    }

    return reminderHelper.parseDuration(expiresIn, now);
}

// configured emojis first
// then the server's other emojis
// then regional numbers for any answers left over
async function pickEmojis(guild, useServerEmojis) {
    if (!useServerEmojis) {
        return CONSTANTS.POLL.EMOJIS;
    }

    const usable = await pollEmojiService.getUsableEmojis(guild);
    const configuredIds = await pollEmojiService.getPollEmojiIds(guild.id) ?? [];

    const configured = configuredIds.map(id => usable.get(id)).filter(Boolean);

    const others = usable.filter(emoji => !configuredIds.includes(emoji.id)).random(usable.size);
    
    const serverEmojis = configured.concat(others).map(emoji => emoji.toString());

    return CONSTANTS.POLL.EMOJIS.map((number, i) => serverEmojis[i] ?? number);
}

function isValidAnswerList(labels) {
    return labels.length >= voteForm.MIN_ANSWERS
        && labels.length <= voteForm.MAX_ANSWERS
        && labels.every(label => label.length <= CONSTANTS.POLL.MAX_ANSWER_LENGTH);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Start a poll')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const formId = `vote-${interaction.id}`;

        await interaction.showModal(voteForm.buildVoteForm(formId));

        let submission;
        try {
            submission = await interaction.awaitModalSubmit({
                filter: submitted => submitted.customId === formId,
                time: CONSTANTS.POLL.FORM_TIMEOUT_MS,
            });
        } catch {
            // the form was closed or left open too long
            return;
        }

        const form = voteForm.readVoteForm(submission.fields);
        const endsAt = getEndsAt(form.expiresIn, new Date());

        if (!isValidAnswerList(form.labels)) {
            await submission.reply({
                content: `Please give ${voteForm.MIN_ANSWERS} to ${voteForm.MAX_ANSWERS} answers, one per line, each up to ${CONSTANTS.POLL.MAX_ANSWER_LENGTH} characters`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (!endsAt) {
            await submission.reply({
                content: 'Please give the expiration in the following format: 30m, 2h or 3 days - or leave it blank for 1 day',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const emojis = await pickEmojis(submission.guild, form.useServerEmojis);
        const options = form.labels.map((label, i) => ({ label, emoji: emojis[i] }));

        const content = pollHelper.buildPollContent({
            question: form.question,
            options,
            votes: options.map(() => []),
            endsAt,
            ended: false,
        });

        // the question and answers are user text, so @everyone or role mentions in them must not ping
        await submission.reply({ content, allowedMentions: { parse: [] } });

        const message = await submission.fetchReply();

        const poll = await pollCommandService.createPoll({
            guildId: submission.guildId,
            channelId: submission.channelId,
            messageId: message.id,
            creatorId: submission.user.id,
            question: form.question,
            options,
            endsAt,
            notify: form.notify,
            singleChoice: form.singleChoice,
        });

        // short polls can end before the next expiry check runs
        pollMessageService.schedulePollEnd(submission.client, poll);

        for (const option of options) {
            await message.react(option.emoji);
        }
    },
};
