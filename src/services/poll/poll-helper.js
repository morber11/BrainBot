const CONSTANTS = require('../../utils/constants.js');

const POLL_ICON = '📊';
const BAR_FILLED = '█';
const BAR_EMPTY = '░';

function buildChart(options, votes) {
    const total = votes.reduce((sum, voters) => sum + voters.length, 0);

    return options.map((option, i) => {
        const count = votes[i].length;
        const share = total === 0 ? 0 : count / total;
        const filled = Math.round(share * CONSTANTS.POLL.BAR_LENGTH);
        const bar = BAR_FILLED.repeat(filled) + BAR_EMPTY.repeat(CONSTANTS.POLL.BAR_LENGTH - filled);

        return `${option.emoji} \`${bar}\` ${count} (${Math.round(share * 100)}%) ${option.label}`;
    }).join('\n');
}

function buildPollContent({ question, options, votes, endsAt, ended }) {
    const footer = ended
        ? '**Vote has ended**'
        : `Vote ends <t:${Math.floor(endsAt.getTime() / 1000)}:R>`;

    return `${POLL_ICON} **${question}**\n\n${buildChart(options, votes)}\n\n${footer}`;
}

function getParticipantIds(votes) {
    return Array.from(new Set(votes.flat()));
}

function describeOutcome(options, votes) {
    const topCount = Math.max(...votes.map(voters => voters.length));

    if (topCount === 0) {
        return 'No votes were cast.';
    }

    const winners = options
        .filter((_option, i) => votes[i].length === topCount)
        .map(option => `**${option.label}**`);

    if (winners.length === 1) {
        return `Winner: ${winners[0]}`;
    }

    return `Tie: ${winners.join(', ')}`;
}

function buildResultsMessage({ question, options, votes }) {
    const outcome = describeOutcome(options, votes);
    const chart = buildChart(options, votes);

    return `${POLL_ICON} The vote **${question}** has ended.\n${outcome}\n\n${chart}`;
}

function buildMentionMessages(userIds) {
    const messages = [];
    let current = '';

    for (const userId of userIds) {
        const mention = `<@${userId}>`;
        const next = current ? `${current} ${mention}` : mention;

        if (next.length > CONSTANTS.POLL.MESSAGE_CHAR_LIMIT) {
            messages.push(current);
            current = mention;
        } else {
            current = next;
        }
    }

    if (current) {
        messages.push(current);
    }

    return messages;
}

module.exports = {
    buildPollContent,
    getParticipantIds,
    buildResultsMessage,
    buildMentionMessages,
};
