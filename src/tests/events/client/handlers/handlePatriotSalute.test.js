const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../utils/constants.js');

describe('handlePatriotSalute handler', () => {
    let handlePatriotSalute;
    let statsStub;
    let responseWindowUtilStub;
    let loggerStub;

    beforeEach(() => {
        statsStub = { incrementUserStat: sinon.stub().resolves() };
        responseWindowUtilStub = { isActive: sinon.stub(), shouldCount: sinon.stub() };
        loggerStub = { error: sinon.stub() };

        handlePatriotSalute = proxyquire('../../../../events/client/handlers/handlePatriotSalute.js', {
            '../../../services/user-stat-command-service.js': statsStub,
            '../../../utils/logger.js': loggerStub,
            '../../../utils/response-window-util.js': responseWindowUtilStub,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('increments salute stat for first o7 from a user', async () => {
        responseWindowUtilStub.isActive.returns(true);
        responseWindowUtilStub.shouldCount.returns(true);

        const message = {
            content: 'o7',
            guild: { id: 'g1' },
            author: { id: 'u1' },
        };

        await handlePatriotSalute(message);

        expect(responseWindowUtilStub.shouldCount).to.have.been.calledWith('g1', 'u1');
        expect(statsStub.incrementUserStat).to.have.been.calledWith(
            'u1',
            CONSTANTS.STATS.SALUTES_GIVEN,
            CONSTANTS.STATS.SALUTES_GIVEN_FRIENDLY
        );
    });

    it('does not increment for repeated salute by same user', async () => {
        responseWindowUtilStub.isActive.returns(true);
        responseWindowUtilStub.shouldCount.returns(false);

        const message = {
            content: 'o7',
            guild: { id: 'g1' },
            author: { id: 'u1' },
        };

        await handlePatriotSalute(message);

        expect(statsStub.incrementUserStat).not.to.have.been.called;
    });

    it('increments for message containing salute emoji', async () => {
        responseWindowUtilStub.isActive.returns(true);
        responseWindowUtilStub.shouldCount.returns(true);

        const message = {
            content: `hello ${CONSTANTS.EMOJI.SALUTE}`,
            guild: { id: 'g1' },
            author: { id: 'u1' },
        };

        await handlePatriotSalute(message);

        expect(statsStub.incrementUserStat).to.have.been.calledWith(
            'u1',
            CONSTANTS.STATS.SALUTES_GIVEN,
            CONSTANTS.STATS.SALUTES_GIVEN_FRIENDLY
        );
    });

    it('increments for message containing salute alias', async () => {
        responseWindowUtilStub.isActive.returns(true);
        responseWindowUtilStub.shouldCount.returns(true);

        const message = {
            content: `hello ${CONSTANTS.EMOJI.SALUTE_EMOJI}`,
            guild: { id: 'g1' },
            author: { id: 'u1' },
        };

        await handlePatriotSalute(message);

        expect(statsStub.incrementUserStat).to.have.been.calledWith(
            'u1',
            CONSTANTS.STATS.SALUTES_GIVEN,
            CONSTANTS.STATS.SALUTES_GIVEN_FRIENDLY
        );
    });

    it('ignores non-guild messages', async () => {
        responseWindowUtilStub.shouldCount.returns(true);

        const message = {
            content: 'o7',
            author: { id: 'u1' },
        };

        await handlePatriotSalute(message);

        expect(statsStub.incrementUserStat).not.to.have.been.called;
    });
});