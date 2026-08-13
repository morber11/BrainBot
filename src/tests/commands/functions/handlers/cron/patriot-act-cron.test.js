const sinon = require('sinon');
const proxyquire = require('proxyquire');
const CONSTANTS = require('../../../../../utils/constants');

describe('patriot act', () => {
    let patriotAct;
    let mockClient;
    let mockSend;
    let mockGuildsCacheValues;
    let loggerStub;
    let clock;
    let statsUtilStub;
    let responseWindowUtilStub;

    beforeEach(() => {
        mockSend = sinon.stub();
        mockGuildsCacheValues = sinon.stub();
        statsUtilStub = { incrementSystemStat: sinon.stub().resolves() };
        responseWindowUtilStub = { start: sinon.stub() };
        loggerStub = { error: sinon.stub(), info: sinon.stub() };

        patriotAct = proxyquire('../../../../../functions/handlers/cron/patriot-act-cron', {
            '../../../services/system-stat-command-service.js': statsUtilStub,
            '../../../utils/logger.js': loggerStub,
            '../../../utils/response-window-util.js': responseWindowUtilStub,
        });

        mockClient = {
            guilds: {
                cache: {
                    values: mockGuildsCacheValues,
                },
            },
        };

        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
        sinon.restore();
    });

    it('should send message to target channel when found', async () => {
        const cronJob = patriotAct(mockClient);
        const mockChannel = { type: 0, name: '2fort', send: mockSend };

        const mockGuild = {
            id: 'g1',
            channels: { cache: { find: (pred) => [mockChannel].find(pred) } },
        };

        mockGuildsCacheValues.returns([mockGuild]);

        const p = cronJob.fireOnTick();
        await clock.tickAsync(CONSTANTS.CRON.PATRIOT_ACT_DELAY_PERIOD);
        await p;

        sinon.assert.calledOnce(mockSend);
        sinon.assert.calledWithExactly(mockSend, 'o7');
        sinon.assert.calledOnce(responseWindowUtilStub.start);
        sinon.assert.calledWithExactly(responseWindowUtilStub.start, 'g1', 60000);
        sinon.assert.calledOnce(statsUtilStub.incrementSystemStat);
        sinon.assert.calledWithExactly(statsUtilStub.incrementSystemStat, CONSTANTS.STATS.PATRIOT_ACT);
        sinon.assert.notCalled(loggerStub.error);
    });

    it('should fall back to "bot/general" channel if specified channel is not found', async () => {
        const cronJob = patriotAct(mockClient);
        const mockBotChannel = { type: 0, name: 'bot', send: mockSend };
        let call = 0;
        const findFn = (pred) => {
            call += 1;
            if (call === 1) return null;
            return [mockBotChannel].find(pred);
        };

        const mockGuild = { id: 'g1', channels: { cache: { find: findFn } } };
        mockGuildsCacheValues.returns([mockGuild]);

        const p = cronJob.fireOnTick();
        await clock.tickAsync(CONSTANTS.CRON.PATRIOT_ACT_DELAY_PERIOD);
        await p;

        expect(call).to.equal(2);
        sinon.assert.calledOnce(mockSend);
        sinon.assert.calledWithExactly(mockSend, 'o7');
        sinon.assert.calledOnce(responseWindowUtilStub.start);
        sinon.assert.calledWithExactly(responseWindowUtilStub.start, 'g1', 60000);
        sinon.assert.calledOnce(statsUtilStub.incrementSystemStat);
        sinon.assert.calledWithExactly(statsUtilStub.incrementSystemStat, CONSTANTS.STATS.PATRIOT_ACT);
    });

    it('should handle errors gracefully', async () => {
        const cronJob = patriotAct(mockClient);
        const mockGuild = { channels: { cache: { find: () => { throw new Error('Test Error'); } } } };

        mockGuildsCacheValues.returns([mockGuild]);

        const p = cronJob.fireOnTick();
        await clock.tickAsync(CONSTANTS.CRON.PATRIOT_ACT_DELAY_PERIOD);
        await p;

        sinon.assert.calledWithMatch(loggerStub.error, 'Error fetching servers or sending message:', sinon.match.instanceOf(Error));
        sinon.assert.notCalled(statsUtilStub.incrementSystemStat);
    });
});
