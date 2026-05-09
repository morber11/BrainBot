const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('system-stat-service', () => {
    let StatStub;
    let statService;

    beforeEach(() => {
        StatStub = { findOrCreate: sinon.stub() };

        statService = proxyquire('../../services/system-stat-service.js', {
            '../dal/models/stat.js': StatStub,
            '../utils/logger.js': { error: sinon.stub() },
        });
    });

    it('findOrCreate should forward to Stat.findOrCreate', async () => {
        const dbRes = [{ id: 1 }, true];
        StatStub.findOrCreate.resolves(dbRes);

        const res = await statService.findOrCreate('test_stat', { count: 0 });

        expect(StatStub.findOrCreate).to.have.been.calledWith({ where: { stat: 'test_stat' }, defaults: { count: 0 } });
        expect(res).to.equal(dbRes);
    });

    it('incrementSystemStat should findOrCreate and increment count', async () => {
        const statRow = { id: 5, increment: sinon.stub().resolves() };
        StatStub.findOrCreate.resolves([statRow, true]);

        const res = await statService.incrementSystemStat('test_stat', 'friendly', 5);

        expect(StatStub.findOrCreate).to.have.been.calledWith({ where: { stat: 'test_stat' }, defaults: { count: 0, friendly_name: 'friendly', sort_order: 5 } });
        expect(statRow.increment).to.have.been.calledWith('count');
        expect(res).to.equal(statRow);
    });
});
