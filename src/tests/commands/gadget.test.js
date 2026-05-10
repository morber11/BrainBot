const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Gadget Command', () => {
    let mockCommandInteraction;
    let stringUtilityStub;
    let pathUtilityStub;
    let gadgetCommand;

    beforeEach(() => {
        stringUtilityStub = { selectRandomFromArray: sinon.stub() };
        pathUtilityStub = { getMediaFilePath: sinon.stub().returns('fake/path/gadget/spoon.jpg') };

        gadgetCommand = proxyquire('../../commands/simple-text-commands/gadget.js', {
            '../../utils/string-util.js': stringUtilityStub,
            '../../utils/path-util.js': pathUtilityStub,
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
        expect(mockCommandInteraction.editReply).to.have.been.calledWith({ content: 'Go Go Gadget spoon!', files: ['fake/path/gadget/spoon.jpg'] });
    });

    it('should handle errors', async () => {
        stringUtilityStub.selectRandomFromArray.throws(new Error('Boom'));

        await gadgetCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.editReply).to.have.been.calledWith('An error occurred.');
    });
});
