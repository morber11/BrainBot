const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../utils/constants.js');

describe('handleBasicReactResponse handler', () => {
    let handleBasicReactResponse;
    let statsStub;
    let loggerStub;

    beforeEach(() => {
        statsStub = { incrementSystemStat: sinon.stub().resolves() };
        loggerStub = { error: sinon.stub() };

        handleBasicReactResponse = proxyquire('../../../../events/client/handlers/handleBasicReactResponse.js', {
            '../../../services/system-stat-command-service.js': statsStub,
            '../../../utils/logger.js': loggerStub,
        });
    });

    it('reacts and increments when content includes "brain"', async () => {
        const message = { content: 'I like brain stuff', guildId: 'g1', channelId: 'c1', id: 'm1', author: { id: 'u1' } };
        message.react = sinon.stub().resolves();

        await handleBasicReactResponse(message);

        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.BRAIN);
        expect(statsStub.incrementSystemStat).to.have.been.calledWith(CONSTANTS.STATS.BRAIN, CONSTANTS.STATS.BRAIN_FRIENDLY);
    });

    it('reacts with regional signs when content includes brain emoji', async () => {
        const message = { content: CONSTANTS.EMOJI.BRAIN, guildId: 'g1', channelId: 'c1', id: 'm2', author: { id: 'u2' } };
        message.react = sinon.stub().resolves();

        await handleBasicReactResponse(message);

        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.REGIONAL_SIGN_B);
        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.REGIONAL_SIGN_R);
        expect(statsStub.incrementSystemStat).to.have.been.calledWith(CONSTANTS.STATS.BRAIN, CONSTANTS.STATS.BRAIN_FRIENDLY);
    });

    it('reacts with thinking emoji when text starts with umm', async () => {
        const message = { content: 'ummmm', guildId: 'g', channelId: 'c', id: 'm3', author: { id: 'u3' } };
        message.react = sinon.stub().resolves();

        await handleBasicReactResponse(message);

        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.THINKING);
    });

    it('reacts with ONE_HUNDRED on maricon', async () => {
        const message = { content: 'maricon', guildId: 'g', channelId: 'c', id: 'm4', author: { id: 'u4' } };
        message.react = sinon.stub().resolves();

        await handleBasicReactResponse(message);

        expect(message.react).to.have.been.calledWith(CONSTANTS.EMOJI.ONE_HUNDRED);
    });

    it('logs errors when message.react throws', async () => {
        const message = { content: 'brain', guildId: 'g', channelId: 'c', id: 'm5', author: { id: 'u5' } };
        message.react = sinon.stub().rejects(new Error('fail'));

        await handleBasicReactResponse(message);

        expect(loggerStub.error).to.have.been.called;
    });
});
