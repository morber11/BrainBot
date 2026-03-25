const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Jim Carrey Command', () => {
    let mockCommandInteraction;
    let CustomUrlStub;
    let stringUtilityStub;
    let jimCarreyCommand;

    beforeEach(() => {
        CustomUrlStub = { findAll: sinon.stub() };
        stringUtilityStub = { selectRandomFromArray: sinon.stub() };

        jimCarreyCommand = proxyquire('../../commands/simple-text-commands/jimcarrey.js', {
            '../../dal/models/custom-url.js': CustomUrlStub,
            '../../utils/string-util.js': stringUtilityStub,
        });

        mockCommandInteraction = {
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
        };
    });

    it('should reply with a Jim Carrey image when URLs are available', async () => {
        const urls = [{ value: '123', url: 'https://www.w3schools.com/js/jc.jpg' }, { value: '456', url: 'https://www.w3schools.com/js/not-jc.jpg' }];
        CustomUrlStub.findAll.resolves(urls);
        stringUtilityStub.selectRandomFromArray.returns(urls[0]);

        await jimCarreyCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('Jim Carrey 123:\nhttps://www.w3schools.com/js/jc.jpg');
    });

    it('should handle when no URLs are available', async () => {
        CustomUrlStub.findAll.resolves([]);

        await jimCarreyCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('No URLs found.');
    });

    it('should handle errors', async () => {
        CustomUrlStub.findAll.rejects(new Error('Oh no an error'));

        await jimCarreyCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('No URLs found.');
    });
});
