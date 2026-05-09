const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Despair Command', () => {
    let mockCommandInteraction;
    let MemberServiceStub;
    let despairCommand;

    beforeEach(() => {
        MemberServiceStub = { findOrCreate: sinon.stub(), update: sinon.stub() };

        despairCommand = proxyquire('../../commands/simple-text-commands/despair.js', {
            '../../services/member-service.js': MemberServiceStub,
        });

        mockCommandInteraction = {
            user: {
                id: '123',
                username: 'testUser',
            },
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
        };
    });

    it('should create a new member if not exists and reply with despair  count', async () => {
        MemberServiceStub.findOrCreate.resolves([{ dataValues: { despairCount: 0 } }, true]);

        await despairCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('Your mental despair is: 0');
    });

    it('should update an existing member and reply with despair count', async () => {
        MemberServiceStub.findOrCreate.resolves([{ dataValues: { despairCount: 5 } }, false]);
        MemberServiceStub.update.resolves([1]);

        await despairCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('Your mental despair is: 5');
        expect(MemberServiceStub.update).to.have.been.calledWith('123', { name: 'testUser' });
    });
});
