const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { Collection, RESTJSONErrorCodes } = require('discord.js');
const CONSTANTS = require('../../../utils/constants.js');

describe('poll-message-service', () => {
    const BOT_ID = 'bot';
    const [EMOJI_1, EMOJI_2] = CONSTANTS.POLL.EMOJIS;
    const DEBOUNCE = CONSTANTS.POLL.REFRESH_DEBOUNCE_MS;

    let pollQueryServiceStub;
    let pollCommandServiceStub;
    let loggerStub;
    let pollMessageService;
    let clock;

    function usersOf(...ids) {
        return {
            users: {
                fetch: sinon.stub().resolves(new Collection(ids.map(id => [id, { id }]))),
                remove: sinon.stub().resolves(),
            },
        };
    }

    function createMessage(id, reactionsByEmoji) {
        return {
            id,
            partial: false,
            reactions: { resolve: emoji => reactionsByEmoji[emoji] },
            edit: sinon.stub().resolves(),
        };
    }

    function createReaction(message) {
        return { message, client: { user: { id: BOT_ID } } };
    }

    function createPoll(messageId) {
        return {
            id: 1,
            messageId,
            question: 'What day?',
            options: [
                { label: 'Monday', emoji: EMOJI_1 },
                { label: 'Tuesday', emoji: EMOJI_2 },
            ],
            endsAt: new Date('2026-10-16T12:00:00Z'),
        };
    }

    beforeEach(() => {
        clock = sinon.useFakeTimers();

        pollQueryServiceStub = { findActivePollByMessageId: sinon.stub().resolves(null) };
        pollCommandServiceStub = { markEnded: sinon.stub().resolves() };
        loggerStub = { error: sinon.stub(), warn: sinon.stub() };

        pollMessageService = proxyquire('../../../services/poll/poll-message-service.js', {
            './poll-query-service.js': pollQueryServiceStub,
            './poll-command-service.js': pollCommandServiceStub,
            '../../utils/logger.js': loggerStub,
        });
    });

    afterEach(() => {
        clock.restore();
    });

    describe('handlePollReaction', () => {
        it('does not edit a message that is not an active poll', async () => {
            const message = createMessage('not-a-poll', {});

            pollMessageService.handlePollReaction(createReaction(message), { id: 'u1' });
            await clock.tickAsync(DEBOUNCE);

            expect(message.edit).not.to.have.been.called;
        });

        it('does not refresh the chart for the bot adding its own reactions', async () => {
            const message = createMessage('bot-reaction', {
                [EMOJI_1]: usersOf(BOT_ID),
                [EMOJI_2]: usersOf(BOT_ID),
            });

            pollQueryServiceStub.findActivePollByMessageId.withArgs('bot-reaction').resolves(createPoll('bot-reaction'));

            pollMessageService.handlePollReaction(createReaction(message), { id: BOT_ID });
            await clock.tickAsync(DEBOUNCE);

            expect(message.edit).not.to.have.been.called;
        });

        it('updates the chart with votes that exclude the bot', async () => {
            const message = createMessage('poll-1', {
                [EMOJI_1]: usersOf(BOT_ID, 'u1', 'u2'),
                [EMOJI_2]: usersOf(BOT_ID),
            });

            pollQueryServiceStub.findActivePollByMessageId.withArgs('poll-1').resolves(createPoll('poll-1'));

            pollMessageService.handlePollReaction(createReaction(message), { id: 'u2' });
            await clock.tickAsync(DEBOUNCE);

            expect(message.edit).to.have.been.calledOnce;

            const lines = message.edit.firstCall.args[0].split('\n');
            expect(lines.find(line => line.startsWith(EMOJI_1))).to.include('2 (100%)');
            expect(lines.find(line => line.startsWith(EMOJI_2))).to.include('0 (0%)');
        });

        it('counts votes on custom server emojis', async () => {
            const customEmoji = '<:party:123456789012345678>';
            const message = createMessage('poll-custom', {
                '123456789012345678': usersOf(BOT_ID, 'u1'),
                [EMOJI_2]: usersOf(BOT_ID),
            });

            const poll = createPoll('poll-custom');
            poll.options[0].emoji = customEmoji;
            pollQueryServiceStub.findActivePollByMessageId.withArgs('poll-custom').resolves(poll);

            pollMessageService.handlePollReaction(createReaction(message), { id: 'u1' });
            await clock.tickAsync(DEBOUNCE);

            const lines = message.edit.firstCall.args[0].split('\n');
            expect(lines.find(line => line.startsWith(customEmoji))).to.include('1 (100%)');
        });

        it('edits once after a burst of reactions settles', async () => {
            const message = createMessage('poll-2', {
                [EMOJI_1]: usersOf(BOT_ID, 'u1'),
                [EMOJI_2]: usersOf(BOT_ID, 'u2', 'u3'),
            });

            pollQueryServiceStub.findActivePollByMessageId.withArgs('poll-2').resolves(createPoll('poll-2'));

            const reaction = createReaction(message);

            pollMessageService.handlePollReaction(reaction, { id: 'u1' });
            await clock.tickAsync(DEBOUNCE / 2);

            pollMessageService.handlePollReaction(reaction, { id: 'u2' });
            await clock.tickAsync(DEBOUNCE / 2);

            pollMessageService.handlePollReaction(reaction, { id: 'u3' });

            await clock.tickAsync(DEBOUNCE - 1);
            expect(message.edit).not.to.have.been.called;

            await clock.tickAsync(1);
            expect(message.edit).to.have.been.calledOnce;
        });

        it('logs when the refresh fails', async () => {
            const message = createMessage('poll-3', {});

            pollQueryServiceStub.findActivePollByMessageId.withArgs('poll-3').rejects(new Error('db down'));

            pollMessageService.handlePollReaction(createReaction(message), { id: 'u1' });
            await clock.tickAsync(DEBOUNCE);

            expect(loggerStub.error).to.have.been.calledOnce;
            expect(loggerStub.error.firstCall.args[1]).to.include({ messageId: 'poll-3' });
        });
    });

    describe('handleSingleChoice', () => {
        function voteFor(message, emoji, userId) {
            const reaction = { ...createReaction(message), emoji: { id: null, name: emoji } };

            pollMessageService.handleSingleChoice(reaction, { id: userId });
        }

        function setUpPoll(messageId, singleChoice) {
            const reactions = {
                [EMOJI_1]: usersOf(BOT_ID),
                [EMOJI_2]: usersOf(BOT_ID),
            };
            const message = createMessage(messageId, reactions);

            pollQueryServiceStub.findActivePollByMessageId
                .withArgs(messageId)
                .resolves({ ...createPoll(messageId), singleChoice });

            return { message, reactions };
        }

        it('removes the voter from every other answer on a single choice poll', async () => {
            const { message, reactions } = setUpPoll('single-1', true);

            voteFor(message, EMOJI_2, 'u1');
            await clock.tickAsync(0);

            expect(reactions[EMOJI_1].users.remove).to.have.been.calledOnceWith('u1');
            expect(reactions[EMOJI_2].users.remove).not.to.have.been.called;
        });

        it('keeps the latest pick when a voter switches answers quickly', async () => {
            const { message, reactions } = setUpPoll('single-2', true);

            voteFor(message, EMOJI_1, 'u1');
            voteFor(message, EMOJI_2, 'u1');
            await clock.tickAsync(0);

            expect(reactions[EMOJI_1].users.remove).to.have.been.calledWith('u1');
            expect(reactions[EMOJI_2].users.remove).not.to.have.been.called;
        });

        it('keeps the vote when the voter adds an emoji that is not an answer', async () => {
            const { message, reactions } = setUpPoll('single-3', true);

            voteFor(message, 'not-an-answer', 'u1');
            await clock.tickAsync(0);

            expect(reactions[EMOJI_1].users.remove).not.to.have.been.called;
            expect(reactions[EMOJI_2].users.remove).not.to.have.been.called;
        });

        it('leaves votes alone on a multiple choice poll', async () => {
            const { message, reactions } = setUpPoll('multiple-1', false);

            voteFor(message, EMOJI_2, 'u1');
            await clock.tickAsync(0);

            expect(reactions[EMOJI_1].users.remove).not.to.have.been.called;
        });
    });

    describe('schedulePollEnd', () => {
        function createClient(message) {
            const channel = {
                messages: { fetch: sinon.stub().withArgs('poll-end').resolves(message) },
                send: sinon.stub().resolves(),
            };

            return {
                channel,
                client: {
                    user: { id: BOT_ID },
                    channels: { fetch: sinon.stub().withArgs('channel-1').resolves(channel) },
                },
            };
        }

        function endedPoll(notify = true) {
            return { ...createPoll('poll-end'), channelId: 'channel-1', notify, endsAt: new Date() };
        }

        async function endNow(client, poll) {
            pollMessageService.schedulePollEnd(client, poll);
            await clock.tickAsync(0);
        }

        it('ends the poll exactly when it is due', async () => {
            const message = createMessage('poll-end', { [EMOJI_1]: usersOf(BOT_ID), [EMOJI_2]: usersOf(BOT_ID) });
            const { client } = createClient(message);
            const poll = { ...endedPoll(), endsAt: new Date(Date.now() + 2 * 60 * 1000) };

            pollMessageService.schedulePollEnd(client, poll);

            await clock.tickAsync(2 * 60 * 1000 - 1);
            expect(message.edit).not.to.have.been.called;

            await clock.tickAsync(1);
            expect(message.edit).to.have.been.calledOnce;
            expect(pollCommandServiceStub.markEnded).to.have.been.calledOnceWith(1);
        });

        it('leaves polls due after the next check for that check to schedule', async () => {
            const message = createMessage('poll-end', {});
            const { client } = createClient(message);
            const poll = { ...endedPoll(), endsAt: new Date(Date.now() + CONSTANTS.POLL.EXPIRY_LOOKAHEAD_MS + 1) };

            pollMessageService.schedulePollEnd(client, poll);
            await clock.tickAsync(CONSTANTS.POLL.EXPIRY_LOOKAHEAD_MS + 1);

            expect(message.edit).not.to.have.been.called;
        });

        it('posts the results once when a poll is scheduled more than once', async () => {
            const message = createMessage('poll-end', { [EMOJI_1]: usersOf(BOT_ID), [EMOJI_2]: usersOf(BOT_ID) });
            const { client, channel } = createClient(message);
            const poll = endedPoll();

            pollMessageService.schedulePollEnd(client, poll);
            await endNow(client, poll);

            expect(channel.send).to.have.been.calledOnce;
        });

        it('marks a poll ended when its message was deleted', async () => {
            const { client, channel } = createClient(null);
            channel.messages.fetch.rejects(Object.assign(new Error('Unknown Message'), { code: RESTJSONErrorCodes.UnknownMessage }));

            await endNow(client, endedPoll());

            expect(pollCommandServiceStub.markEnded).to.have.been.calledOnceWith(1);
            expect(loggerStub.warn).to.have.been.calledOnce;
        });

        it('leaves a poll open and closes it on the next attempt when ending fails for another reason', async () => {
            const message = createMessage('poll-end', { [EMOJI_1]: usersOf(BOT_ID), [EMOJI_2]: usersOf(BOT_ID) });
            const { client, channel } = createClient(message);
            const poll = endedPoll();

            channel.messages.fetch.onFirstCall().rejects(new Error('Discord unavailable'));

            await endNow(client, poll);

            expect(pollCommandServiceStub.markEnded).not.to.have.been.called;
            expect(loggerStub.error.firstCall.args[1]).to.include({ pollId: 1 });

            await endNow(client, poll);

            expect(message.edit).to.have.been.calledOnce;
            expect(pollCommandServiceStub.markEnded).to.have.been.calledOnceWith(1);
        });

        it('marks the message ended, posts results, then pings every voter once', async () => {
            const message = createMessage('poll-end', {
                [EMOJI_1]: usersOf(BOT_ID, 'u1', 'u2'),
                [EMOJI_2]: usersOf(BOT_ID, 'u1'),
            });
            const { client, channel } = createClient(message);

            await endNow(client, endedPoll());

            expect(message.edit).to.have.been.calledOnce;
            expect(message.edit.firstCall.args[0]).not.to.include('<t:');

            expect(channel.send).to.have.been.calledTwice;
            expect(channel.send.firstCall.args[0].content).not.to.include('<@');

            const mentions = channel.send.secondCall.args[0];
            expect(mentions.match(/<@u1>/g)).to.have.length(1);
            expect(mentions.match(/<@u2>/g)).to.have.length(1);
            expect(mentions).not.to.include(`<@${BOT_ID}>`);

            expect(pollCommandServiceStub.markEnded).to.have.been.calledOnceWith(1);
        });

        it('does not let mentions in the question ping anyone when posting results', async () => {
            const message = createMessage('poll-end', { [EMOJI_1]: usersOf(BOT_ID), [EMOJI_2]: usersOf(BOT_ID) });
            const { client, channel } = createClient(message);

            await endNow(client, { ...endedPoll(), question: '@everyone what day?' });

            expect(channel.send.firstCall.args[0].allowedMentions).to.deep.equal({ parse: [] });
        });

        it('pings every voter across several messages when the mentions do not fit in one', async () => {
            const voterIds = Array.from({ length: 150 }, (_, i) => String(100000000000000000n + BigInt(i)));
            const message = createMessage('poll-end', {
                [EMOJI_1]: usersOf(BOT_ID, ...voterIds),
                [EMOJI_2]: usersOf(BOT_ID),
            });
            const { client, channel } = createClient(message);

            await endNow(client, endedPoll());

            const [results, ...pings] = channel.send.args.map(args => args[0]);

            expect(results.content).not.to.include('<@');
            expect(pings.length).to.be.greaterThan(1);

            for (const ping of pings) {
                expect(ping.length).to.be.at.most(CONSTANTS.POLL.MESSAGE_CHAR_LIMIT);
            }

            const mentionedIds = pings.join(' ').match(/\d+/g);
            expect(mentionedIds).to.deep.equal(voterIds);
        });

        it('posts results without a ping message when nobody voted', async () => {
            const message = createMessage('poll-end', {
                [EMOJI_1]: usersOf(BOT_ID),
                [EMOJI_2]: usersOf(BOT_ID),
            });
            const { client, channel } = createClient(message);

            await endNow(client, endedPoll());

            expect(channel.send).to.have.been.calledOnce;
            expect(pollCommandServiceStub.markEnded).to.have.been.calledOnceWith(1);
        });

        it('posts results without pinging voters when notify is off', async () => {
            const message = createMessage('poll-end', {
                [EMOJI_1]: usersOf(BOT_ID, 'u1'),
                [EMOJI_2]: usersOf(BOT_ID, 'u2'),
            });
            const { client, channel } = createClient(message);

            await endNow(client, endedPoll(false));

            expect(channel.send).to.have.been.calledOnce;
            expect(channel.send.firstCall.args[0].content).not.to.include('<@');
            expect(pollCommandServiceStub.markEnded).to.have.been.calledOnceWith(1);
        });

        it('cancels a pending live refresh so it cannot overwrite the ended poll', async () => {
            const message = createMessage('poll-end', {
                [EMOJI_1]: usersOf(BOT_ID, 'u1'),
                [EMOJI_2]: usersOf(BOT_ID),
            });

            pollQueryServiceStub.findActivePollByMessageId.withArgs('poll-end').resolves(createPoll('poll-end'));

            const { client } = createClient(message);

            pollMessageService.handlePollReaction(createReaction(message), { id: 'u1' });
            await endNow(client, endedPoll());
            await clock.tickAsync(DEBOUNCE);

            expect(message.edit).to.have.been.calledOnce;
            expect(message.edit.firstCall.args[0]).not.to.include('<t:');
        });
    });
});
