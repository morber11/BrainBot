const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('handleAsking handler', () => {
    let handleAsking;
    let askStub;
    let loggerStub;

    beforeEach(() => {
        askStub = { chanceToSend: sinon.stub().resolves(true) };
        loggerStub = { error: sinon.stub() };

        handleAsking = proxyquire('../../../../events/client/handlers/handleAsking.js', {
            '../../../utils/ask-util.js': askStub,
            '../../../utils/logger.js': loggerStub,
        });
    });

    it('calls ask.chanceToSend when message has guild', async () => {
        const message = { guild: { id: 'g1' }, guildId: 'g1', channelId: 'c1', id: 'm1', author: { id: 'u1' } };
        
        await handleAsking(message);
        expect(askStub.chanceToSend).to.have.been.calledWith(message);
    });

    it('does not call ask.chanceToSend when no guild', async () => {
        const message = { guild: null, guildId: null, channelId: 'c1', id: 'm2', author: { id: 'u2' } };

        await handleAsking(message);
        expect(askStub.chanceToSend).to.not.have.been.called;
    });

    it('logs errors when ask.chanceToSend throws', async () => {
        askStub.chanceToSend.rejects(new Error('fail'));
        const message = { guild: { id: 'g1' }, guildId: 'g1', channelId: 'c1', id: 'm3', author: { id: 'u3' } };

        await handleAsking(message);
        expect(loggerStub.error).to.have.been.called;
    });
});
