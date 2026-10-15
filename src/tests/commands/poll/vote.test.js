const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { MessageFlags, Collection } = require('discord.js');
const CONSTANTS = require('../../../utils/constants.js');

describe('Vote command', () => {
    let pollCommandServiceStub;
    let pollMessageServiceStub;
    let voteCommand;
    let mockInteraction;
    let mockSubmission;
    let mockMessage;
    let clock;

    function submitForm(question, answers, { expiration = '', choice = 'multiple', settings = ['notify'] } = {}) {
        const getTextInputValue = sinon.stub();
        getTextInputValue.withArgs('question').returns(question);
        getTextInputValue.withArgs('answers').returns(answers);
        getTextInputValue.withArgs('expiration').returns(expiration);

        const getRadioGroup = sinon.stub().withArgs('choice').returns(choice);
        const getCheckboxGroup = sinon.stub().withArgs('settings').returns(settings);

        mockSubmission.fields = { getTextInputValue, getRadioGroup, getCheckboxGroup };
    }

    function serverEmoji(id, { available = true, roleCount = 0 } = {}) {
        return {
            id,
            available,
            roles: { cache: { size: roleCount } },
            toString: () => `<:emoji${id}:${id}>`,
        };
    }

    function setServerEmojis(...emojis) {
        const collection = new Collection(emojis.map(emoji => [emoji.id, emoji]));

        mockSubmission.guild = { emojis: { fetch: sinon.stub().resolves(collection) } };
    }

    function savedEmojis() {
        return pollCommandServiceStub.createPoll.firstCall.args[0].options.map(option => option.emoji);
    }

    beforeEach(() => {
        clock = sinon.useFakeTimers(new Date('2026-10-15T12:00:00Z'));

        pollCommandServiceStub = {
            createPoll: sinon.stub().resolves({ id: 1 }),
        };

        pollMessageServiceStub = { schedulePollEnd: sinon.stub() };

        voteCommand = proxyquire('../../../commands/poll/vote.js', {
            '../../services/poll/poll-command-service.js': pollCommandServiceStub,
            '../../services/poll/poll-message-service.js': pollMessageServiceStub,
        });

        mockMessage = {
            id: 'msg-1',
            react: sinon.stub().resolves(),
        };

        mockSubmission = {
            reply: sinon.stub().resolves(),
            fetchReply: sinon.stub().resolves(mockMessage),
            user: { id: 'creator-1' },
            channelId: 'channel-1',
            guildId: 'guild-1',
        };

        mockInteraction = {
            id: 'interaction-1',
            showModal: sinon.stub().resolves(),
            awaitModalSubmit: sinon.stub().resolves(mockSubmission),
        };
    });

    afterEach(() => {
        clock.restore();
    });

    it('saves one answer per non-blank line with emojis in order', async () => {
        submitForm('What day?', 'Monday\n\n  Tuesday  \nThursday\n');

        await voteCommand.execute(mockInteraction);

        expect(pollCommandServiceStub.createPoll).to.have.been.calledOnceWith({
            guildId: 'guild-1',
            channelId: 'channel-1',
            messageId: 'msg-1',
            creatorId: 'creator-1',
            question: 'What day?',
            options: [
                { label: 'Monday', emoji: CONSTANTS.POLL.EMOJIS[0] },
                { label: 'Tuesday', emoji: CONSTANTS.POLL.EMOJIS[1] },
                { label: 'Thursday', emoji: CONSTANTS.POLL.EMOJIS[2] },
            ],
            endsAt: new Date('2026-10-16T12:00:00Z'),
            notify: true,
            singleChoice: false,
        });
    });

    it('saves a single choice poll when single choice is picked', async () => {
        submitForm('What day?', 'Monday\nTuesday', { choice: 'single' });

        await voteCommand.execute(mockInteraction);

        expect(pollCommandServiceStub.createPoll.firstCall.args[0]).to.include({ singleChoice: true });
    });

    it('saves the poll without notifications when the ping option is unticked', async () => {
        submitForm('What day?', 'Monday\nTuesday', { settings: [] });

        await voteCommand.execute(mockInteraction);

        expect(pollCommandServiceStub.createPoll.firstCall.args[0]).to.include({ notify: false });
    });

    it('does not let mentions in the question or answers ping anyone when posting the poll', async () => {
        submitForm('@everyone what day?', '<@&123456789012345678>\nTuesday');

        await voteCommand.execute(mockInteraction);

        expect(mockSubmission.reply.firstCall.args[0].allowedMentions).to.deep.equal({ parse: [] });
    });

    it('seeds one reaction per answer in answer order', async () => {
        submitForm('What day?', 'Monday\nTuesday\nThursday');

        await voteCommand.execute(mockInteraction);

        expect(mockMessage.react.args.map(args => args[0])).to.deep.equal(CONSTANTS.POLL.EMOJIS.slice(0, 3));
    });

    const invalidAnswers = {
        'only one answer': 'Monday',
        'more answers than emojis': Array.from({ length: CONSTANTS.POLL.EMOJIS.length + 1 }, (_, i) => `Day ${i}`).join('\n'),
        'an answer that is too long': `Monday\n${'x'.repeat(CONSTANTS.POLL.MAX_ANSWER_LENGTH + 1)}`,
    };

    for (const [description, answers] of Object.entries(invalidAnswers)) {
        it(`asks the user to fix their answers when given ${description}`, async () => {
            submitForm('What day?', answers);

            await voteCommand.execute(mockInteraction);

            expect(pollCommandServiceStub.createPoll).not.to.have.been.called;
            expect(mockSubmission.reply).to.have.been.calledOnce;
            expect(mockSubmission.reply.firstCall.args[0]).to.have.property('flags', MessageFlags.Ephemeral);
        });
    }

    it('uses only server emojis the bot can react with', async () => {
        submitForm('What day?', 'Monday\nTuesday', { settings: ['server-emojis'] });
        setServerEmojis(
            serverEmoji('1'),
            serverEmoji('2', { available: false }),
            serverEmoji('3', { roleCount: 1 }),
            serverEmoji('4'),
        );

        await voteCommand.execute(mockInteraction);

        expect(savedEmojis()).to.have.members(['<:emoji1:1>', '<:emoji4:4>']);
        expect(mockMessage.react.args.map(args => args[0])).to.deep.equal(savedEmojis());
    });

    it('falls back to number emojis when the server does not have enough', async () => {
        submitForm('What day?', 'Monday\nTuesday\nThursday', { settings: ['server-emojis'] });
        setServerEmojis(serverEmoji('1'), serverEmoji('2'));

        await voteCommand.execute(mockInteraction);

        expect(savedEmojis()).to.deep.equal(CONSTANTS.POLL.EMOJIS.slice(0, 3));
    });

    it('ends the vote after the expiration given', async () => {
        submitForm('What day?', 'Monday\nTuesday', { expiration: ' 2h ' });

        await voteCommand.execute(mockInteraction);

        expect(pollCommandServiceStub.createPoll.firstCall.args[0].endsAt).to.deep.equal(new Date('2026-10-15T14:00:00Z'));
    });

    it('asks the user to fix an expiration it cannot understand', async () => {
        submitForm('What day?', 'Monday\nTuesday', { expiration: 'next week' });

        await voteCommand.execute(mockInteraction);

        expect(pollCommandServiceStub.createPoll).not.to.have.been.called;
        expect(mockSubmission.reply.firstCall.args[0]).to.have.property('flags', MessageFlags.Ephemeral);
    });

    it('does nothing when the form is closed without submitting', async () => {
        mockInteraction.awaitModalSubmit.rejects(new Error('Collector received no interactions before ending with reason: time'));

        await voteCommand.execute(mockInteraction);

        expect(mockSubmission.reply).not.to.have.been.called;
        expect(pollCommandServiceStub.createPoll).not.to.have.been.called;
    });
});
