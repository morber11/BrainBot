const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../utils/constants.js');
const botMessageWindowUtil = require('../../../../utils/bot-message-window-util.js');

describe('handleReplies handler', () => {
    let handleReplies;
    let loggerStub;

    function createMessage(content, channelId = 'c1') {
        return { content, channelId, react: sinon.stub().resolves() };
    }

    beforeEach(() => {
        sinon.useFakeTimers();
        loggerStub = { error: sinon.stub() };

        handleReplies = proxyquire('../../../../events/client/handlers/handleReplies.js', {
            '../../../utils/logger.js': loggerStub,
        });
    });

    afterEach(() => {
        botMessageWindowUtil.resetForTests();
    });

    it('reacts with a heart to thanks after the bot posts', async () => {
        botMessageWindowUtil.open('c1');
        const message = createMessage('Thanks brainbot');

        await handleReplies(message);

        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.HEART);
    });

    it('reacts with a heart to thank you after the bot posts', async () => {
        botMessageWindowUtil.open('c1');
        const message = createMessage('thank you');

        await handleReplies(message);

        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.HEART);
    });

    it('does not react to words that only start with thanks', async () => {
        botMessageWindowUtil.open('c1');
        const message = createMessage('happy thanksgiving');

        await handleReplies(message);

        expect(message.react).not.to.have.been.called;
    });

    it('does not react when the bot has not posted recently', async () => {
        const message = createMessage('thanks');

        await handleReplies(message);

        expect(message.react).not.to.have.been.called;
    });

    it('does not react when the bot posted in another channel', async () => {
        botMessageWindowUtil.open('c2');
        const message = createMessage('thanks');

        await handleReplies(message);

        expect(message.react).not.to.have.been.called;
    });

    it('logs errors when responding fails', async () => {
        botMessageWindowUtil.open('c1');
        const message = createMessage('thanks');
        message.react.rejects(new Error('fail'));

        await handleReplies(message);

        expect(loggerStub.error).to.have.been.called;
    });
});
