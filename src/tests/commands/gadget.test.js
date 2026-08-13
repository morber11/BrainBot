const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Gadget Command', () => {
    let mockCommandInteraction;
    let stringUtilityStub;
    let pathUtilityStub;
    let userStatCommandServiceStub;
    let systemStatCommandServiceStub;
    let loggerStub;
    let gadgetCommand;

    beforeEach(() => {
        stringUtilityStub = { selectRandomFromArray: sinon.stub() };
        pathUtilityStub = { getMediaFilePath: sinon.stub().returns('fake/path/gadget/spoon.jpg') };
        userStatCommandServiceStub = { incrementUserStat: sinon.stub().resolves() };
        systemStatCommandServiceStub = { incrementSystemStat: sinon.stub().resolves() };
        loggerStub = { error: sinon.stub(), warn: sinon.stub() };

        gadgetCommand = proxyquire('../../commands/simple-text-commands/gadget.js', {
            '../../utils/string-util.js': stringUtilityStub,
            '../../utils/path-util.js': pathUtilityStub,
            '../../services/user-stat-command-service.js': userStatCommandServiceStub,
            '../../services/system-stat-command-service.js': systemStatCommandServiceStub,
            '../../utils/logger.js': loggerStub,
        });

        mockCommandInteraction = {
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
            user: { id: 'user-1' },
        };
    });

    it('should reply with a random gadget item', async () => {
        stringUtilityStub.selectRandomFromArray.returns('spoon');

        await gadgetCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith({ content: 'Go Go Gadget spoon!', files: ['fake/path/gadget/spoon.jpg'] });
        expect(userStatCommandServiceStub.incrementUserStat).to.have.been.calledOnce;
        expect(systemStatCommandServiceStub.incrementSystemStat).to.have.been.calledOnce;
    });

    it('should handle errors', async () => {
        stringUtilityStub.selectRandomFromArray.throws(new Error('Boom'));

        await gadgetCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.editReply).to.have.been.calledWith('An error occurred.');
        expect(loggerStub.error).to.have.been.calledOnce;
    });
});
