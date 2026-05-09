const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../utils/constants.js');

describe('messageReactionAdd event handler', () => {
    let handler;
    let statsStub;
    let responseWindowUtilStub;
    let loggerStub;

    beforeEach(() => {
        statsStub = { incrementUserStat: sinon.stub().resolves() };
        responseWindowUtilStub = { isActive: sinon.stub(), shouldCount: sinon.stub() };
        loggerStub = { error: sinon.stub() };

        handler = proxyquire('../../../events/client/message-reaction-add.js', {
            '../../services/user-stat-service.js': statsStub,
            '../../utils/logger.js': loggerStub,
            '../../utils/response-window-util.js': responseWindowUtilStub,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('increments user stat for salute emoji reaction', async () => {
        responseWindowUtilStub.isActive.returns(true);
        responseWindowUtilStub.shouldCount.returns(true);

        const reaction = {
            emoji: { name: CONSTANTS.EMOJI.SALUTE },
            message: { guild: { id: 'g1' } },
        };
        const user = { id: 'u1', bot: false };

        await handler.execute(reaction, user);

        expect(statsStub.incrementUserStat).to.have.been.calledWith(
            'u1',
            CONSTANTS.STATS.SALUTES_GIVEN,
            CONSTANTS.STATS.SALUTES_GIVEN_FRIENDLY
        );
    });

    it('does not increment for non-salute emoji', async () => {
        responseWindowUtilStub.shouldCount.returns(true);

        const reaction = {
            emoji: { name: '👍' },
            message: { guild: { id: 'g1' } },
        };
        const user = { id: 'u1', bot: false };

        await handler.execute(reaction, user);

        expect(statsStub.incrementUserStat).not.to.have.been.called;
    });

    it('does not increment when user already counted', async () => {
        responseWindowUtilStub.isActive.returns(true);
        responseWindowUtilStub.shouldCount.returns(false);

        const reaction = {
            emoji: { name: CONSTANTS.EMOJI.SALUTE },
            message: { guild: { id: 'g1' } },
        };
        const user = { id: 'u1', bot: false };

        await handler.execute(reaction, user);

        expect(statsStub.incrementUserStat).not.to.have.been.called;
    });

    it('increments user stat for salute emoji alias name', async () => {
        responseWindowUtilStub.isActive.returns(true);
        responseWindowUtilStub.shouldCount.returns(true);

        const reaction = {
            emoji: { name: 'saluting_face' },
            message: { guild: { id: 'g1' } },
        };
        const user = { id: 'u2', bot: false };

        await handler.execute(reaction, user);

        expect(statsStub.incrementUserStat).to.have.been.calledWith(
            'u2',
            CONSTANTS.STATS.SALUTES_GIVEN,
            CONSTANTS.STATS.SALUTES_GIVEN_FRIENDLY
        );
    });
});
