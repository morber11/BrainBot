const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('stats-util', () => {
    let statsUtil;
    let StatStub;
    let UserStatStub;

    beforeEach(() => {
        StatStub = { findOrCreate: sinon.stub() };
        UserStatStub = { findOrCreate: sinon.stub(), update: sinon.stub() };

        statsUtil = proxyquire('../../utils/stats-util.js', {
            '../dal/models/stat.js': StatStub,
            '../dal/models/user-stat.js': UserStatStub,
            './logger.js': { error: sinon.stub() },
        });
    });

    it('incrementSystemStat should findOrCreate and increment count', async () => {
        const mockRow = { increment: sinon.stub() };
        StatStub.findOrCreate.resolves([mockRow]);

        const res = await statsUtil.incrementSystemStat('test_stat', 'friendly', 5);

        expect(StatStub.findOrCreate).to.have.been.calledWith({
            where: { stat: 'test_stat' },
            defaults: { count: 0, friendly_name: 'friendly', sort_order: 5 },
        });
        expect(mockRow.increment).to.have.been.calledWith('count');
        expect(res).to.equal(mockRow);
    });

    it('incrementUserStat should create row with friendly name and increment', async () => {
        const mockRow = { increment: sinon.stub(), id: 1, user_friendly_name: '' };
        UserStatStub.findOrCreate.resolves([mockRow, true]);

        const res = await statsUtil.incrementUserStat('user1', 'brain', 'Brain Friendly');

        expect(UserStatStub.findOrCreate).to.have.been.calledWith({
            where: { userId: 'user1', stat: 'brain' },
            defaults: { count: 0, user_friendly_name: 'Brain Friendly' },
        });
        expect(mockRow.increment).to.have.been.calledWith('count');
        expect(res).to.equal(mockRow);
    });

    it('incrementUserStat should update friendly name when existing row differs', async () => {
        const mockRow = { increment: sinon.stub(), id: 2, user_friendly_name: '' };
        UserStatStub.findOrCreate.resolves([mockRow, false]);

        await statsUtil.incrementUserStat('user2', 'brain', 'New Friendly');

        expect(UserStatStub.update).to.have.been.calledWith({ user_friendly_name: 'New Friendly' }, { where: { id: mockRow.id } });
        expect(mockRow.increment).to.have.been.calledWith('count');
    });
});
