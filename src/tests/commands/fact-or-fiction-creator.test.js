const { AttachmentBuilder } = require('discord.js');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Fact or Fictionator Command', () => {
    let mockCommandInteraction;
    let mathRandomStub;
    let FactOrFictionServiceStub;
    let cryptUtilStub;
    let pathUtilityStub;
    let constantsStub;
    let stringUtilityStub;
    let factOrFictionatorCommand;

    beforeEach(() => {
        mathRandomStub = sinon.stub(Math, 'random').returns(1.5 / 999);

        FactOrFictionServiceStub = { findOrCreate: sinon.stub(), update: sinon.stub() };
        cryptUtilStub = { getHash: sinon.stub() };
        pathUtilityStub = { getMediaFilePath: sinon.stub() };
        constantsStub = {};
        stringUtilityStub = { selectRandomFromArray: sinon.stub() };

        factOrFictionatorCommand = proxyquire('../../commands/simple-text-commands/fact-or-fiction-creator.js', {
            '../../services/fact-or-fiction-service.js': FactOrFictionServiceStub,
            '../../utils/crypt-util.js': cryptUtilStub,
            '../../utils/path-util.js': pathUtilityStub,
            '../../utils/constants.js': constantsStub,
            '../../utils/string-util.js': stringUtilityStub,
        });

        mockCommandInteraction = {
            options: { getString: sinon.stub() },
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
            reply: sinon.stub(),
        };

        constantsStub.FACT_OR_FICTION = {
            VALUES: { FACT: 'fact', FICTION: 'fiction' },
            RESPONSES: [
                { category: 'fact', response: 'fact' },
                { category: 'fiction', response: 'fiction' },
            ],
        };
    });

    afterEach(() => {
        mathRandomStub.restore();
        sinon.restore();
    });

    it('should reply with the correct fact or fiction result and an attachment', async () => {
        const url = 'https://en.wikipedia.org/wiki/Beyond_Belief:_Fact_or_Fiction';
        const expectedResponse = 'fact';
        const expectedAttachmentPath = 'path/to/fact.gif';

        const mockFactOrFictionEntry = { dataValues: { value: constantsStub.FACT_OR_FICTION.VALUES.FACT }, id: 1 };

        mockCommandInteraction.options.getString.returns(url);
        cryptUtilStub.getHash.resolves('hashed_value');
        FactOrFictionServiceStub.findOrCreate.resolves([mockFactOrFictionEntry, false]);
        stringUtilityStub.selectRandomFromArray.returns({ response: expectedResponse });
        pathUtilityStub.getMediaFilePath.returns(expectedAttachmentPath);

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        const expectedContent = `Did you manage to work it out? \nThe story in question: \`${url}\`\n${expectedResponse}\n`;

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith({
            content: expectedContent,
            files: [sinon.match.instanceOf(AttachmentBuilder)],
        });
    });

    it('should create a new fact or fiction entry if one does not exist and return a response with attachment', async () => {
        const url = 'https://www.google.com/';
        mockCommandInteraction.options.getString.returns(url);
        cryptUtilStub.getHash.resolves('new_hashed_value');

        const mockFactOrFictionEntry = { dataValues: { value: null }, id: 2 };

        FactOrFictionServiceStub.findOrCreate.resolves([mockFactOrFictionEntry, true]);

        stringUtilityStub.selectRandomFromArray.returns({ response: 'fiction' });
        pathUtilityStub.getMediaFilePath.returns('path/to/fiction.gif');

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        sinon.assert.calledWith(FactOrFictionServiceStub.update, 2, constantsStub.FACT_OR_FICTION.VALUES.FICTION);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith({
            content: `Did you manage to work it out? \nThe story in question: \`https://www.google.com/\`\nfiction\n`,
            files: [sinon.match.instanceOf(AttachmentBuilder)],
        });
    });

    it('should reply with a fact or fiction result if the entry already exists', async () => {
        const url = 'https://en.wikipedia.org/wiki/Beyond_Belief:_Fact_or_Fiction';
        mockCommandInteraction.options.getString.returns(url);
        cryptUtilStub.getHash.resolves('existing_hashed_value');

        const mockFactOrFictionEntry = { dataValues: { value: constantsStub.FACT_OR_FICTION.VALUES.FICTION }, id: 3 };

        FactOrFictionServiceStub.findOrCreate.resolves([mockFactOrFictionEntry, false]);
        stringUtilityStub.selectRandomFromArray.returns({ response: 'fiction' });
        pathUtilityStub.getMediaFilePath.returns('path/to/fiction.gif');

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith({
            content: `Did you manage to work it out? \nThe story in question: \`https://en.wikipedia.org/wiki/Beyond_Belief:_Fact_or_Fiction\`\nfiction\n`,
            files: [sinon.match.instanceOf(AttachmentBuilder)],
        });
    });

    it('should handle errors', async () => {
        const errorMessage = 'Something went wrong during processing';
        cryptUtilStub.getHash.rejects(new Error(errorMessage));

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).to.have.been.calledWith({
            content: 'An error occurred.',
            ephemeral: true,
        });
    });
});