const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Magic Ball Command', () => {
    let mockCommandInteraction;
    let stringUtilityStub;
    let constantsStub;
    let loggerStub;
    let magicBallCommand;

    beforeEach(() => {
        stringUtilityStub = { selectRandomFromArray: sinon.stub() };
        constantsStub = { MAGIC_BALL: { RESPONSES: [{ response: 'Yes, definitely' }, { response: 'Ask again later' }, { response: 'No way' }] } };
        loggerStub = { error: sinon.stub() };

        magicBallCommand = proxyquire('../../commands/simple-text-commands/magic-ball.js', {
            '../../utils/string-util.js': stringUtilityStub,
            '../../utils/constants.js': constantsStub,
            '../../utils/logger.js': loggerStub,
        });

        mockCommandInteraction = {
            options: {
                getString: sinon.stub(),
            },
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
        };
    });

    it('should reply with a random Magic Ball response', async () => {
        const question = 'Will this test work?';
        mockCommandInteraction.options.getString.returns(question);
        stringUtilityStub.selectRandomFromArray.returns(constantsStub.MAGIC_BALL.RESPONSES[0]);

        await magicBallCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith(
            `You have pondered the Magic 9-Ball for guidance\nYour answer is: Yes, definitely.\nYour question was: "Will this test work?"`
        );
    });

    it('should handle errors', async () => {
        stringUtilityStub.selectRandomFromArray.throws(new Error('Something went wrong'));

        await magicBallCommand.execute(mockCommandInteraction);
        
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('An error occurred.');
        expect(loggerStub.error).to.have.been.calledOnce;
    });
});
