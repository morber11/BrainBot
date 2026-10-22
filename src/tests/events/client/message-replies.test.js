const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../utils/constants.js');
const responseWindowUtil = require('../../../utils/response-window-util.js');

describe('messageReplies event handler', () => {
    let messageReplies;
    let loggerStub;
    let clock;

    const client = { user: { id: 'bot' } };

    function createMessage(content, { authorId = 'u1', bot = false, channelId = 'c1', botName = 'BrainBot' } = {}) {
        return {
            content,
            channelId,
            client,
            guild: { members: { me: { displayName: botName } } },
            author: { id: authorId, bot },
            react: sinon.stub().resolves(),
        };
    }

    async function botPosts(channelId = 'c1') {
        await messageReplies.execute(createMessage('a gadget', { authorId: 'bot', bot: true, channelId }));
    }

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        loggerStub = { error: sinon.stub() };

        messageReplies = proxyquire('../../../events/client/message-replies.js', {
            '../../utils/logger.js': loggerStub,
        });
    });

    afterEach(() => {
        responseWindowUtil.resetForTests();
    });

    it('reacts with a heart to thanks after the bot posts', async () => {
        await botPosts();
        const message = createMessage('Thanks brainbot');

        await messageReplies.execute(message);

        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.HEART);
    });

    it('reacts with a heart to thank you after the bot posts', async () => {
        await botPosts();
        const message = createMessage('thank you brainbot');

        await messageReplies.execute(message);

        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.HEART);
    });

    it('reacts when the bot has been renamed in the guild', async () => {
        await botPosts();
        const message = createMessage('thanks Smart Bot', { botName: 'Smart Bot' });

        await messageReplies.execute(message);

        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.HEART);
    });

    it('falls back to brainbot when the bot has been renamed', async () => {
        await botPosts();
        const message = createMessage('thanks brainbot', { botName: 'Smart Bot' });

        await messageReplies.execute(message);

        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.HEART);
    });

    it('does not react to thanks without the bot name', async () => {
        await botPosts();
        const message = createMessage('thanks');

        await messageReplies.execute(message);

        expect(message.react).not.to.have.been.called;
    });

    it('does not react to thanks for someone else', async () => {
        await botPosts();
        const message = createMessage('thanks bob');

        await messageReplies.execute(message);

        expect(message.react).not.to.have.been.called;
    });

    it('does not react to words that only start with thanks', async () => {
        await botPosts();
        const message = createMessage('happy thanksgiving');

        await messageReplies.execute(message);

        expect(message.react).not.to.have.been.called;
    });

    it('does not react when the bot has not posted', async () => {
        const message = createMessage('thanks brainbot');

        await messageReplies.execute(message);

        expect(message.react).not.to.have.been.called;
    });

    it('does not react more than a minute after the bot posts', async () => {
        await botPosts();
        clock.tick(60000);
        const message = createMessage('thanks brainbot');

        await messageReplies.execute(message);

        expect(message.react).not.to.have.been.called;
    });

    it('does not react when the bot posted in another channel', async () => {
        await botPosts('c2');
        const message = createMessage('thanks brainbot');

        await messageReplies.execute(message);

        expect(message.react).not.to.have.been.called;
    });

    it('does not open the window for other bots', async () => {
        await messageReplies.execute(createMessage('a gadget', { authorId: 'other-bot', bot: true }));
        const message = createMessage('thanks brainbot');

        await messageReplies.execute(message);

        expect(message.react).not.to.have.been.called;
    });

    it('logs errors when responding fails', async () => {
        await botPosts();
        const message = createMessage('thanks brainbot');
        message.react.rejects(new Error('fail'));

        await messageReplies.execute(message);

        expect(loggerStub.error).to.have.been.called;
    });
});
