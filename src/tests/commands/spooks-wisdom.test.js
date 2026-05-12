const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Spooks-wisdom Command', () => {
    let mockCommandInteraction;
    let stringUtilityStub;
    let pathUtilityStub;
    let spookswisdomCommand;

    beforeEach(() => {
        stringUtilityStub = { selectRandomFromArray: sinon.stub() };
        pathUtilityStub = { getMediaFilePath: sinon.stub().returns('fake/path/spookswisdom/1.jpg') };

        spookswisdomCommand = proxyquire('../../commands/simple-text-commands/spooks-wisdom.js', {
            '../../utils/string-util.js': stringUtilityStub,
            '../../utils/path-util.js': pathUtilityStub,
        });

        mockCommandInteraction = {
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
        };
    });

    it('should reply with a random master gregory quote', async () => {
        stringUtilityStub.selectRandomFromArray.returns({ id: 1, phrase: 'The trick is not to spill', file: '1.jpg' });

        await spookswisdomCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith({ content: '*The trick is not to spill*', files: ['fake/path/spookswisdom/1.jpg'] });
    });

    it('should handle errors', async () => {
        stringUtilityStub.selectRandomFromArray.throws(new Error('Boom'));

        await spookswisdomCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.editReply).to.have.been.calledWith('An error occurred.');
    });
});
