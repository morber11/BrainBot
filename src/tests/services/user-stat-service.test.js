const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('user-stat-service', () => {
    let UserStatStub;
    let userStatService;

    beforeEach(() => {
        UserStatStub = {
            findAll: sinon.stub(),
            findOrCreate: sinon.stub(),
            findOne: sinon.stub(),
            update: sinon.stub(),
        };

        userStatService = proxyquire('../../services/user-stat-service.js', {
            '../dal/models/user-stat.js': UserStatStub,
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

});