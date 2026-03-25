const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Gadget Command', () => {
    let mockCommandInteraction;
    let stringUtilityStub;
    let gadgetCommand;

    beforeEach(() => {
        stringUtilityStub = { selectRandomFromArray: sinon.stub() };

        gadgetCommand = proxyquire('../../commands/simple-text-commands/gadget.js', {
            '../../utils/string-util.js': stringUtilityStub,
        });

        mockCommandInteraction = {
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
        };
    });

    it('should reply with a random gadget item', async () => {
        stringUtilityStub.selectRandomFromArray.returns('spoon');

        await gadgetCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('Go Go Gadget spoon!');
    });

    it('should handle errors', async () => {
        stringUtilityStub.selectRandomFromArray.throws(new Error('Boom'));

        await gadgetCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.editReply).to.have.been.calledWith('An error occurred.');
    });
});
