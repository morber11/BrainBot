const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('system-stat-command-service', () => {
    let StatStub;
    let statCommandService;

    beforeEach(() => {
        StatStub = { findOrCreate: sinon.stub(), increment: sinon.stub().resolves() };

        statCommandService = proxyquire('../../services/system-stat-command-service.js', {
            '../dal/models/stat.js': StatStub,
            '../utils/logger.js': { error: sinon.stub() },
        });
    });

    it('increments a system stat', async () => {
        const statRow = { id: 5 };
        StatStub.findOrCreate.resolves([statRow, true]);

        const res = await statCommandService.incrementSystemStat('test_stat', 'friendly', 5);

        expect(StatStub.findOrCreate).to.have.been.calledWith({
            where: { stat: 'test_stat' },
            defaults: { count: 0, friendly_name: 'friendly', sort_order: 5 },
        });
        expect(StatStub.increment).to.have.been.calledWith('count', { where: { id: 5 } });
        expect(res).to.equal(statRow);
    });
});
