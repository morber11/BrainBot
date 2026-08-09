const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('user-stat-command-service', () => {
    let UserStatStub;
    let userStatCommandService;

    beforeEach(() => {
        UserStatStub = {
            findOrCreate: sinon.stub(),
            update: sinon.stub(),
        };

        userStatCommandService = proxyquire('../../services/user-stat-command-service.js', {
            '../dal/models/user-stat.js': UserStatStub,
            '../utils/logger.js': { error: sinon.stub() },
        });
    });

    it('increments a newly created user stat', async () => {
        const row = { id: 10, increment: sinon.stub().resolves() };
        UserStatStub.findOrCreate.resolves([row, true]);

        const res = await userStatCommandService.incrementUserStat('user1', 'brain', 'Brain Friendly');

        expect(UserStatStub.findOrCreate).to.have.been.calledWith({
            where: { userId: 'user1', stat: 'brain' },
            defaults: { count: 0, user_friendly_name: 'Brain Friendly' },
        });
        expect(row.increment).to.have.been.calledWith('count');
        expect(res).to.equal(row);
    });

    it('updates a changed friendly name before incrementing', async () => {
        const row = { id: 11, user_friendly_name: 'Old', increment: sinon.stub().resolves() };
        UserStatStub.findOrCreate.resolves([row, false]);
        UserStatStub.update.resolves([1]);

        const res = await userStatCommandService.incrementUserStat('user2', 'brain', 'New Friendly');

        expect(UserStatStub.update).to.have.been.calledWith(
            { user_friendly_name: 'New Friendly' },
            { where: { id: 11 } }
        );
        expect(row.increment).to.have.been.calledWith('count');
        expect(res).to.equal(row);
    });
});