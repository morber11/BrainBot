const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { MessageFlags } = require('discord.js');

describe('Birthday command', () => {
    let birthdayServiceStub;
    let birthdayCommand;
    let mockInteraction;

    beforeEach(() => {
        birthdayServiceStub = { setBirthday: sinon.stub().resolves() };

        birthdayCommand = proxyquire('../../../commands/tools/birthday.js', {
            '../../services/birthday-service.js': birthdayServiceStub,
        });

        mockInteraction = {
            options: { getInteger: sinon.stub() },
            reply: sinon.stub().resolves(),
            user: { id: 'user-1' },
            guildId: 'guild-1',
        };
    });

    it('should save the birthday for the user in this server', async () => {
        mockInteraction.options.getInteger.withArgs('day').returns(29);
        mockInteraction.options.getInteger.withArgs('month').returns(2);

        await birthdayCommand.execute(mockInteraction);

        expect(birthdayServiceStub.setBirthday).to.have.been.calledOnceWith({
            guildId: 'guild-1',
            userId: 'user-1',
            month: 2,
            day: 29,
        });
        expect(mockInteraction.reply).to.have.been.calledOnce;
    });

    it('should reject a date that does not exist', async () => {
        mockInteraction.options.getInteger.withArgs('day').returns(31);
        mockInteraction.options.getInteger.withArgs('month').returns(4);

        await birthdayCommand.execute(mockInteraction);

        expect(birthdayServiceStub.setBirthday).to.not.have.been.called;
        expect(mockInteraction.reply.firstCall.args[0]).to.have.property('flags', MessageFlags.Ephemeral);
    });
});
