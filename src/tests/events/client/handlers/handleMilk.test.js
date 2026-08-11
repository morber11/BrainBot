const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../utils/constants.js');

describe('handleMilk handler', () => {
    let handleMilk;
    let statsStub;
    let pathStub;
    let loggerStub;

    beforeEach(() => {
        statsStub = { incrementSystemStat: sinon.stub().resolves() };
        pathStub = { getMediaFilePath: sinon.stub().returns('fake/path/milk03.mp3') };
        loggerStub = { error: sinon.stub() };

        handleMilk = proxyquire('../../../../events/client/handlers/handleMilk.js', {
            '../../../services/system-stat-command-service.js': statsStub,
            '../../../utils/path-util.js': pathStub,
            '../../../utils/logger.js': loggerStub,
        });
    });

    it('replies and increments when content includes "milk"', async () => {
        const message = { content: 'I want milk', guildId: 'g1', channelId: 'c1', id: 'm1', author: { id: 'u1' }, reply: sinon.stub().resolves() };

        await handleMilk(message);

        expect(statsStub.incrementSystemStat).to.have.been.calledWith(CONSTANTS.STATS.MILK, CONSTANTS.STATS.MILK_FRIENDLY);
        expect(message.reply).to.have.been.calledWith({ files: ['fake/path/milk03.mp3'] });
    });

    it('logs errors when message.reply throws', async () => {
        const message = { content: 'milk', guildId: 'g1', channelId: 'c1', id: 'm2', author: { id: 'u2' }, reply: sinon.stub().rejects(new Error('fail')) };

        await handleMilk(message);

        expect(loggerStub.error).to.have.been.called;
    });
});
