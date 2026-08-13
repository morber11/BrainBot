const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Brain Command', () => {
    let mockCommandInteraction;
    let stringUtilityStub;
    let userStatCommandServiceStub;
    let brainCommand;

    beforeEach(() => {
        stringUtilityStub = { isNumeric: sinon.stub() };
        userStatCommandServiceStub = { incrementUserStat: sinon.stub().resolves() };

        brainCommand = proxyquire('../../commands/simple-text-commands/brain.js', {
            '../../utils/string-util.js': stringUtilityStub,
            '../../services/user-stat-command-service.js': userStatCommandServiceStub,
        });

        mockCommandInteraction = {
            options: {
                getString: sinon.stub(),
            },
            reply: sinon.stub(),
            user: { id: 'user-1' },
        };
    });

    it('should reply with the correct number of brains when a valid number is provided', async () => {
        const numBrains = '5';
        mockCommandInteraction.options.getString.returns(numBrains);
        stringUtilityStub.isNumeric.returns(true);

        await brainCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).to.have.been.calledWith('brain brain brain brain brain');
        expect(userStatCommandServiceStub.incrementUserStat).to.have.been.calledOnce;
    });

    it('should limit the number of brains', async () => {
        const numBrains = '400';
        mockCommandInteraction.options.getString.returns(numBrains);
        stringUtilityStub.isNumeric.returns(true);

        await brainCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).to.have.been.calledWith('brain '.repeat(330).trimEnd());
    });

    it('should handle non-numeric input by returning default', async () => {
        const numBrains = 'not-a-number';
        mockCommandInteraction.options.getString.returns(numBrains);
        stringUtilityStub.isNumeric.returns(false);

        await brainCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).to.have.been.calledWith('brain brain brain brain');
    });

    it('should handle 0 brains', async () => {
        const numBrains = '0';
        mockCommandInteraction.options.getString.returns(numBrains);
        stringUtilityStub.isNumeric.returns(true);

        await brainCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).to.have.been.calledWith('');
    });
});
