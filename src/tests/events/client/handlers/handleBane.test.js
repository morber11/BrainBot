const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../utils/constants.js');

describe('handleBane handler', () => {
    let handleBane;
    let statsStub;
    let mathStub;
    let pathStub;
    let loggerStub;

    beforeEach(() => {
        statsStub = { incrementSystemStat: sinon.stub().resolves() };
        mathStub = { getRandomInt: sinon.stub() };
        pathStub = { getMediaFilePath: sinon.stub().returns('fake/path/bane.jpeg') };
        loggerStub = { error: sinon.stub() };

        handleBane = proxyquire('../../../../events/client/handlers/handleBane.js', {
            '../../../services/system-stat-service.js': statsStub,
            '../../../utils/math-util.js': mathStub,
            '../../../utils/path-util.js': pathStub,
            '../../../utils/logger.js': loggerStub,
        });
    });

    it('replies and increments when content matches and chance passes', async () => {
        mathStub.getRandomInt.returns(0);
        const message = { content: 'tell me about bane', guildId: 'g1', channelId: 'c1', id: 'm1', author: { id: 'u1' }, reply: sinon.stub().resolves() };

        await handleBane(message);

        expect(statsStub.incrementSystemStat).to.have.been.calledWith(CONSTANTS.STATS.BANE, CONSTANTS.STATS.BANE_FRIENDLY);
        expect(message.reply).to.have.been.calledWith({ files: ['fake/path/bane.jpeg'] });
    });

    it('does not reply when chance fails', async () => {
        mathStub.getRandomInt.returns(50);
        const message = { content: 'tell me about bane', guildId: 'g2', channelId: 'c2', id: 'm2', author: { id: 'u2' }, reply: sinon.stub().resolves() };

        await handleBane(message);

        expect(statsStub.incrementSystemStat).to.not.have.been.called;
        expect(message.reply).to.not.have.been.called;
    });

    it('respects cooldown and does not reply twice in quick succession', async () => {
        mathStub.getRandomInt.returns(0);
        const message = { content: 'tell me about bane', guildId: 'g3', channelId: 'c3', id: 'm3', author: { id: 'u3' }, reply: sinon.stub().resolves() };

        await handleBane(message);
        await handleBane(message);

        expect(statsStub.incrementSystemStat).to.have.been.calledOnce;
        expect(message.reply).to.have.been.calledOnce;
    });

    it('dev mode ignores cooldown and always replies', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        mathStub.getRandomInt.returns(99);

        handleBane = proxyquire('../../../../events/client/handlers/handleBane.js', {
            '../../../services/system-stat-service.js': statsStub,
            '../../../utils/math-util.js': mathStub,
            '../../../utils/path-util.js': pathStub,
            '../../../utils/logger.js': loggerStub,
        });

        const message = { content: 'tell me about bane', guildId: 'g4', channelId: 'c4', id: 'm4', author: { id: 'u4' }, reply: sinon.stub().resolves() };

        await handleBane(message);
        await handleBane(message);

        expect(statsStub.incrementSystemStat).to.have.been.calledTwice;
        expect(message.reply).to.have.been.calledTwice;

        process.env.NODE_ENV = originalEnv;
    });

    it('logs errors when message.reply throws', async () => {
        mathStub.getRandomInt.returns(0);
        const message = { content: 'tell me about bane', guildId: 'g5', channelId: 'c5', id: 'm5', author: { id: 'u5' }, reply: sinon.stub().rejects(new Error('fail')) };

        await handleBane(message);

        expect(loggerStub.error).to.have.been.called;
    });
});
