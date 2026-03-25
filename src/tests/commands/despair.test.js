const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Despair Command', () => {
    let mockCommandInteraction;
    let MemberStub;
    let despairCommand;

    beforeEach(() => {
        MemberStub = { findOrCreate: sinon.stub(), update: sinon.stub() };

        despairCommand = proxyquire('../../commands/simple-text-commands/despair.js', {
            '../../dal/models/member.js': MemberStub,
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
        MemberStub.findOrCreate.resolves([{ dataValues: { despairCount: 0 } }, true]);

        await despairCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('Your mental despair is: 0');
    });

    it('should update an existing member and reply with despair count', async () => {
        MemberStub.findOrCreate.resolves([{ dataValues: { despairCount: 5 } }, false]);
        MemberStub.update.resolves([1]);

        await despairCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('Your mental despair is: 5');
        expect(MemberStub.update).to.have.been.calledWith(
            { name: 'testUser' },
            { where: { id: '123' } }
        );
    });
});
