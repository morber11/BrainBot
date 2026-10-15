const { parseEmoji, RESTJSONErrorCodes } = require('discord.js');
const pollCommandService = require('./poll-command-service.js');
const pollQueryService = require('./poll-query-service.js');
const pollHelper = require('./poll-helper.js');
const CONSTANTS = require('../../utils/constants.js');
const logger = require('../../utils/logger.js');

const pendingRefreshes = new Map();
const latestChoices = new Map();
const scheduledEnds = new Set();

function getReactionKey(emoji) {
    return parseEmoji(emoji).id ?? emoji;
}

async function fetchVotes(message, options, botUserId) {
    const votes = [];

    for (const option of options) {
        const reaction = message.reactions.resolve(getReactionKey(option.emoji));

        if (!reaction) {
            votes.push([]);
            continue;
        }

        const users = await reaction.users.fetch();
        votes.push(users.filter(user => user.id !== botUserId).map(user => user.id));
    }

    return votes;
}

async function refreshPollMessage(reactionMessage, botUserId) {
    const poll = await pollQueryService.findActivePollByMessageId(reactionMessage.id);

    if (!poll) return;

    const message = reactionMessage.partial ? await reactionMessage.fetch() : reactionMessage;
    const votes = await fetchVotes(message, poll.options, botUserId);

    await message.edit(pollHelper.buildPollContent({
        question: poll.question,
        options: poll.options,
        votes,
        endsAt: poll.endsAt,
        ended: false,
    }));
}

async function removeOtherVotes(reactionMessage, userId) {
    const poll = await pollQueryService.findActivePollByMessageId(reactionMessage.id);

    if (!poll?.singleChoice) {
        latestChoices.delete(reactionMessage.id);
        return;
    }

    const answerKeys = poll.options.map(option => getReactionKey(option.emoji));
    const latestChoice = latestChoices.get(reactionMessage.id).get(userId);

    if (!answerKeys.includes(latestChoice)) {
        return;
    }

    const message = reactionMessage.partial ? await reactionMessage.fetch() : reactionMessage;

    for (const answerKey of answerKeys) {
        if (answerKey === latestChoice) {
            continue;
        }

        await message.reactions.resolve(answerKey)?.users.remove(userId);
    }
}

function handleSingleChoice(reaction, user) {
    if (user.id === reaction.client.user.id) return;

    const messageId = reaction.message.id;

    if (!latestChoices.has(messageId)) {
        latestChoices.set(messageId, new Map());
    }

    latestChoices.get(messageId).set(user.id, reaction.emoji.id ?? reaction.emoji.name);

    removeOtherVotes(reaction.message, user.id).catch(err => {
        logger.error('failed to remove other votes on single choice poll', { messageId, err });
    });
}

function handlePollReaction(reaction, user) {
    const botUserId = reaction.client.user.id;

    if (user.id === botUserId) {
        return;
    }

    const messageId = reaction.message.id;
    clearTimeout(pendingRefreshes.get(messageId));

    const refresh = setTimeout(async () => {
        pendingRefreshes.delete(messageId);

        try {
            await refreshPollMessage(reaction.message, botUserId);
        } catch (err) {
            logger.error('failed to refresh poll', { messageId, err });
        }
    }, CONSTANTS.POLL.REFRESH_DEBOUNCE_MS);

    pendingRefreshes.set(messageId, refresh);
}

async function endPoll(client, poll) {
    clearTimeout(pendingRefreshes.get(poll.messageId));
    pendingRefreshes.delete(poll.messageId);
    latestChoices.delete(poll.messageId);

    const channel = await client.channels.fetch(poll.channelId);
    const message = await channel.messages.fetch(poll.messageId);
    const votes = await fetchVotes(message, poll.options, client.user.id);

    await message.edit(pollHelper.buildPollContent({
        question: poll.question,
        options: poll.options,
        votes,
        endsAt: poll.endsAt,
        ended: true,
    }));

    await channel.send({
        content: pollHelper.buildResultsMessage({ question: poll.question, options: poll.options, votes }),
        allowedMentions: { parse: [] }, // nothing in the message should ping anyone otherwise people without the right roles could exploit the bot to do it
    });

    if (poll.notify) {
        const participantIds = pollHelper.getParticipantIds(votes);

        for (const mentions of pollHelper.buildMentionMessages(participantIds)) {
            await channel.send(mentions);
        }
    }

    await pollCommandService.markEnded(poll.id);
}

async function endPollSafely(client, poll) {
    try {
        await endPoll(client, poll);
    } catch (err) {
        if (err.code === RESTJSONErrorCodes.UnknownMessage || err.code === RESTJSONErrorCodes.UnknownChannel) {
            await pollCommandService.markEnded(poll.id);
            logger.warn('poll message or channel no longer exists, marking poll ended', { pollId: poll.id });
            return;
        }

        logger.error('failed to end poll', { pollId: poll.id, err });
    }
}

// sets a one off timer so the poll closes on time instead of at the next 5 minute check
function schedulePollEnd(client, poll) {
    const delay = poll.endsAt.getTime() - Date.now();

    // already has a timer, or too far away (the expiry check will schedule it later)
    if (scheduledEnds.has(poll.id) || delay > CONSTANTS.POLL.EXPIRY_LOOKAHEAD_MS) return;

    scheduledEnds.add(poll.id);

    // a poll already past its end time closes straight away
    setTimeout(() => {
        endPollSafely(client, poll)
            .catch(err => logger.error('failed to close poll', { pollId: poll.id, err }))
            .finally(() => scheduledEnds.delete(poll.id));
    }, Math.max(delay, 0));
}

module.exports = { handlePollReaction, handleSingleChoice, schedulePollEnd };
