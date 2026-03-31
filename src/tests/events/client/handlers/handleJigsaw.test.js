const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../utils/constants.js');

describe('handleJigsaw handler', () => {
    let handleJigsaw;
    let statsStub;
    let pathStub;
    let loggerStub;

    beforeEach(() => {
        statsStub = { incrementStat: sinon.stub().resolves() };
        pathStub = { getMediaFilePath: sinon.stub().returns('fake/path/jigsaw.jpg') };
        loggerStub = { error: sinon.stub() };

        handleJigsaw = proxyquire('../../../../events/client/handlers/handleJigsaw.js', {
            '../../../utils/stats-util.js': statsStub,
            '../../../utils/path-util.js': pathStub,
            '../../../utils/logger.js': loggerStub,
        });
    });

    it('replies and increments when content includes "make your choice"', async () => {
        const message = { content: 'please make your choice', guildId: 'g1', channelId: 'c1', id: 'm1', author: { id: 'u1' }, reply: sinon.stub().resolves() };

        await handleJigsaw(message);

        expect(statsStub.incrementStat).to.have.been.calledWith(CONSTANTS.STATS.JIGSAW, CONSTANTS.STATS.JIGSAW_FRIENDLY);
        expect(message.reply).to.have.been.calledWith({ files: ['fake/path/jigsaw.jpg'] });
    });

    it('logs errors when message.reply throws', async () => {
        const message = { content: 'make your choice', guildId: 'g1', channelId: 'c1', id: 'm2', author: { id: 'u2' }, reply: sinon.stub().rejects(new Error('fail')) };

        await handleJigsaw(message);

        expect(loggerStub.error).to.have.been.called;
    });
});
