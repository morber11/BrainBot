const pollHelper = require('../../../services/poll/poll-helper.js');
const CONSTANTS = require('../../../utils/constants.js');

describe('poll-helper', () => {
    const [EMOJI_1, EMOJI_2, EMOJI_3] = CONSTANTS.POLL.EMOJIS;
    const options = [
        { label: 'Monday', emoji: EMOJI_1 },
        { label: 'Tuesday', emoji: EMOJI_2 },
        { label: 'Wednesday', emoji: EMOJI_3 },
    ];
    const endsAt = new Date('2026-10-16T12:00:00Z');

    function chartLines(content) {
        return content.split('\n').filter(line => CONSTANTS.POLL.EMOJIS.some(emoji => line.startsWith(emoji)));
    }

    describe('buildPollContent', () => {
        it('shows the count and share of votes for each answer in answer order', () => {
            const content = pollHelper.buildPollContent({
                question: 'What day?',
                options,
                votes: [['u1', 'u2', 'u3'], ['u4'], ['u5']],
                endsAt,
                ended: false,
            });

            const lines = chartLines(content);

            expect(content).to.include('What day?');
            expect(lines).to.have.length(3);
            expect(lines[0]).to.include('3 (60%)').and.include('Monday');
            expect(lines[1]).to.include('1 (20%)').and.include('Tuesday');
            expect(lines[2]).to.include('1 (20%)').and.include('Wednesday');
        });

        it('shows zero for every answer when nobody has voted', () => {
            const content = pollHelper.buildPollContent({
                question: 'What day?',
                options,
                votes: [[], [], []],
                endsAt,
                ended: false,
            });

            for (const line of chartLines(content)) {
                expect(line).to.include('0 (0%)');
            }
        });

        it('shows when the vote ends while active, and not once ended', () => {
            const args = { question: 'What day?', options, votes: [[], [], []], endsAt };

            const active = pollHelper.buildPollContent({ ...args, ended: false });
            const ended = pollHelper.buildPollContent({ ...args, ended: true });

            expect(active).to.include(`<t:${Math.floor(endsAt.getTime() / 1000)}:R>`);
            expect(ended).not.to.include('<t:');
        });
    });

    describe('buildResultsMessage', () => {
        it('names only the winner when one answer leads', () => {
            const results = pollHelper.buildResultsMessage({ question: 'What day?', options, votes: [['u1', 'u2'], ['u3'], []] });
            const outcome = results.split('\n')[1];

            expect(outcome).to.include('Monday');
            expect(outcome).not.to.include('Tuesday');
        });

        it('names every tied answer', () => {
            const results = pollHelper.buildResultsMessage({ question: 'What day?', options, votes: [['u1'], ['u2'], []] });
            const outcome = results.split('\n')[1];

            expect(outcome).to.include('Monday').and.include('Tuesday');
            expect(outcome).not.to.include('Wednesday');
        });

        it('names no winner when nobody voted', () => {
            const results = pollHelper.buildResultsMessage({ question: 'What day?', options, votes: [[], [], []] });
            const outcome = results.split('\n')[1];

            for (const option of options) {
                expect(outcome).not.to.include(option.label);
            }
        });
    });

    describe('buildMentionMessages', () => {
        it('fits a few participants in one message', () => {
            expect(pollHelper.buildMentionMessages(['1', '2', '3'])).to.deep.equal(['<@1> <@2> <@3>']);
        });

        it('splits on whole mentions without exceeding the message limit', () => {
            const userIds = Array.from({ length: 150 }, (_, i) => String(100000000000000000n + BigInt(i)));

            const messages = pollHelper.buildMentionMessages(userIds);

            expect(messages.length).to.be.greaterThan(1);
            for (const message of messages) {
                expect(message.length).to.be.at.most(CONSTANTS.POLL.MESSAGE_CHAR_LIMIT);
                expect(message).to.match(/^<@\d+>( <@\d+>)*$/);
            }

            const mentioned = messages.join(' ').match(/\d+/g);
            expect(mentioned).to.deep.equal(userIds);
        });
    });
});
