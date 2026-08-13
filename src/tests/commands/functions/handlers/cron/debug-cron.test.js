const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('debug cron', () => {
    let cronJob;
    let mockClient;
    let loggerStub;

    beforeEach(() => {
        loggerStub = {
            info: sinon.stub(),
            error: sinon.stub(),
        };

        mockClient = { guilds: { cache: { values: sinon.stub() } } };
        const debug = proxyquire('../../../../../functions/handlers/cron/debug-cron', {
            '../../../utils/logger.js': loggerStub,
        });

        cronJob = debug(mockClient);
    });

    it('should handle errors gracefully', async () => {
        mockClient.guilds.cache.values.throws(new Error('Test Error'));

        await cronJob.fireOnTick();

        sinon.assert.calledWithMatch(loggerStub.error, 'Error while fetching servers or sending messages:', sinon.match.instanceOf(Error));
    });
});
