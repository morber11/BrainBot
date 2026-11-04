const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { MessageFlags } = require('discord.js');

describe('Remove birthday command', () => {
    let birthdayServiceStub;
    let removeBirthdayCommand;
    let mockInteraction;

    beforeEach(() => {
        birthdayServiceStub = { removeBirthday: sinon.stub() };

        removeBirthdayCommand = proxyquire('../../../commands/tools/remove-birthday.js', {
            '../../services/birthday-service.js': birthdayServiceStub,
        });

        mockInteraction = {
            reply: sinon.stub().resolves(),
            user: { id: 'user-1' },
            guildId: 'guild-1',
        };
    });

    it("should remove the user's own birthday in this server", async () => {
        birthdayServiceStub.removeBirthday.resolves(1);

        await removeBirthdayCommand.execute(mockInteraction);

        expect(birthdayServiceStub.removeBirthday).to.have.been.calledOnceWith('guild-1', 'user-1');
        expect(mockInteraction.reply.firstCall.args[0]).to.not.have.property('flags');
    });

    it('should tell the user when they have no birthday saved', async () => {
        birthdayServiceStub.removeBirthday.resolves(0);

        await removeBirthdayCommand.execute(mockInteraction);

        expect(mockInteraction.reply.firstCall.args[0]).to.have.property('flags', MessageFlags.Ephemeral);
    });
});
