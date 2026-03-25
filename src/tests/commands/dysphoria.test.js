const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Dysphoria Command', () => {
    let mockCommandInteraction;
    let CustomUrlStub;
    let stringUtilityStub;
    let dysphoriaCommand;

    beforeEach(() => {
        CustomUrlStub = { findAll: sinon.stub() };
        stringUtilityStub = { selectRandomFromArray: sinon.stub() };

        dysphoriaCommand = proxyquire('../../commands/simple-text-commands/dysphoria.js', {
            '../../dal/models/custom-url.js': CustomUrlStub,
            '../../utils/string-util.js': stringUtilityStub,
        });

        mockCommandInteraction = {
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
        };
    });

    it('should reply with a URL when URLs are available', async () => {
        const urls = [{ url: 'https://www.w3schools.com/js/' }, { url: 'https://google.com/' }];
        CustomUrlStub.findAll.resolves(urls);
        stringUtilityStub.selectRandomFromArray.returns(urls[0]);

        await dysphoriaCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('https://www.w3schools.com/js/');
    });

    it('should handle when no URLs are available', async () => {
        CustomUrlStub.findAll.resolves([]);

        await dysphoriaCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('No URLs found.');
    });

    it('should handle errors', async () => {
        CustomUrlStub.findAll.rejects(new Error("Oh no an error"));

        await dysphoriaCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith('No URLs found.');
    });
});
