const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('user-stat-service', () => {
    let UserStatStub;
    let StatStub;
    let userStatService;

    beforeEach(() => {
        UserStatStub = {
            findAll: sinon.stub(),
            findOrCreate: sinon.stub(),
            findOne: sinon.stub(),
            update: sinon.stub(),
        };

        StatStub = {
            findOrCreate: sinon.stub(),
        };

        userStatService = proxyquire('../../services/user-stat-service.js', {
            '../dal/models/user-stat.js': UserStatStub,
            '../dal/models/stat.js': StatStub,
        });
    });

    it('should findAllByUser', async () => {
        const rows = [{ stat: 'a' }];
        UserStatStub.findAll.resolves(rows);

        const res = await userStatService.findAllByUser('user1', ['stat'], [['count', 'DESC']]);

        expect(UserStatStub.findAll).to.have.been.calledWith({ raw: true, where: { userId: 'user1' }, attributes: ['stat'], order: [['count', 'DESC']] });
        expect(res).to.equal(rows);
    });

    it('should findOrCreate user stat', async () => {
        const dbRes = [{ id: 1, increment: sinon.stub() }, true];
        UserStatStub.findOrCreate.resolves(dbRes);

        const res = await userStatService.findOrCreate('user1', 'brain', { count: 0, user_friendly_name: 'Brain' });

        expect(UserStatStub.findOrCreate).to.have.been.calledWith({ where: { userId: 'user1', stat: 'brain' }, defaults: { count: 0, user_friendly_name: 'Brain' } });
        expect(res).to.equal(dbRes);
    });

    it('should findOneByUserAndStat', async () => {
        const row = { id: 2 };
        UserStatStub.findOne.resolves(row);

        const res = await userStatService.findOneByUserAndStat('user2', 'gadget', { attributes: ['count'] });

        expect(UserStatStub.findOne).to.have.been.calledWith({ where: { userId: 'user2', stat: 'gadget' }, attributes: ['count'] });
        expect(res).to.equal(row);
    });

    it('should updateById', async () => {
        UserStatStub.update.resolves([1]);

        const res = await userStatService.updateById(3, { user_friendly_name: 'X' });

        expect(UserStatStub.update).to.have.been.calledWith({ user_friendly_name: 'X' }, { where: { id: 3 } });
        expect(res).to.deep.equal([1]);
    });

    it('incrementUserStat should create row with friendly name and increment', async () => {
        const row = { id: 10, increment: sinon.stub().resolves() };
        UserStatStub.findOrCreate.resolves([row, true]);

        const res = await userStatService.incrementUserStat('user1', 'brain', 'Brain Friendly');

        expect(UserStatStub.findOrCreate).to.have.been.calledWith({ where: { userId: 'user1', stat: 'brain' }, defaults: { count: 0, user_friendly_name: 'Brain Friendly' } });
        expect(row.increment).to.have.been.calledWith('count');
        expect(res).to.equal(row);
    });

    it('incrementUserStat should update friendly name when existing row differs', async () => {
        const row = { id: 11, user_friendly_name: 'Old', increment: sinon.stub().resolves() };
        UserStatStub.findOrCreate.resolves([row, false]);
        UserStatStub.update.resolves([1]);

        const res = await userStatService.incrementUserStat('user2', 'brain', 'New Friendly');

        expect(UserStatStub.update).to.have.been.calledWith({ user_friendly_name: 'New Friendly' }, { where: { id: 11 } });
        expect(row.increment).to.have.been.calledWith('count');
        expect(res).to.equal(row);
    });

});
