const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Dysphoria Command', () => {
    let mockCommandInteraction;
    let CustomUrlServiceStub;
    let stringUtilityStub;
    let dysphoriaCommand;

    beforeEach(() => {
        CustomUrlServiceStub = { findAllByType: sinon.stub() };
        stringUtilityStub = { selectRandomFromArray: sinon.stub() };

        dysphoriaCommand = proxyquire('../../commands/simple-text-commands/dysphoria.js', {
            '../../services/custom-url-service.js': CustomUrlServiceStub,
            '../../utils/string-util.js': stringUtilityStub,
        });

        mockCommandInteraction = {
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
        };
    });

    it('should reply with a URL when URLs are available', async () => {
        const urls = [{ url: 'https://www.w3schools.com/js/' }, { url: 'https://google.com/' }];
        CustomUrlServiceStub.findAllByType.resolves(urls);
        stringUtilityStub.selectRandomFromArray.returns(urls[0]);

        await dysphoriaCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('https://www.w3schools.com/js/');
    });

    it('should handle when no URLs are available', async () => {
        CustomUrlServiceStub.findAllByType.resolves([]);

        await dysphoriaCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('No URLs found.');
    });

    it('should handle errors', async () => {
        CustomUrlServiceStub.findAllByType.rejects(new Error("Oh no an error"));

        await dysphoriaCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('No URLs found.');
    });
});
