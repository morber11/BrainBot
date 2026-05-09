const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../utils/constants.js');

describe('handleRaven handler', () => {
    let handleRaven;
    let statsStub;
    let pathStub;
    let loggerStub;

    beforeEach(() => {
        statsStub = { incrementSystemStat: sinon.stub().resolves() };
        pathStub = { getMediaFilePath: sinon.stub().returns('fake/path/raven-1.gif') };
        loggerStub = { error: sinon.stub() };

        handleRaven = proxyquire('../../../../events/client/handlers/handleRaven.js', {
            '../../../services/system-stat-service.js': statsStub,
            '../../../utils/path-util.js': pathStub,
            '../../../utils/logger.js': loggerStub,
        });
    });

    it('replies and increments when content includes "lost a life"', async () => {
        const message = { content: 'we lost a life', guildId: 'g1', channelId: 'c1', id: 'm1', author: { id: 'u1' }, reply: sinon.stub().resolves() };

        await handleRaven(message);

        expect(statsStub.incrementSystemStat).to.have.been.calledWith(CONSTANTS.STATS.RAVEN, CONSTANTS.STATS.RAVEN_FRIENDLY);
        expect(message.reply).to.have.been.calledWith({ files: ['fake/path/raven-1.gif'] });
    });

    it('logs errors when message.reply throws', async () => {
        const message = { content: 'lost a life', guildId: 'g1', channelId: 'c1', id: 'm2', author: { id: 'u2' }, reply: sinon.stub().rejects(new Error('fail')) };

        await handleRaven(message);

        expect(loggerStub.error).to.have.been.called;
    });
});
