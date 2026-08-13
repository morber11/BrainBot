const { AttachmentBuilder } = require('discord.js');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Fact or Fictionator Command', () => {
    let mockCommandInteraction;
    let mathRandomStub;
    let FactOrFictionServiceStub;
    let factOrFictionOutcomeServiceStub;
    let cryptUtilStub;
    let pathUtilityStub;
    let userStatServiceStub;
    let constantsStub;
    let loggerStub;
    let factOrFictionatorCommand;

    beforeEach(() => {
        mathRandomStub = sinon.stub(Math, 'random').returns(1.5 / 999);

        FactOrFictionServiceStub = { findOrCreate: sinon.stub(), update: sinon.stub() };
        factOrFictionOutcomeServiceStub = { resolveFactOrFictionOutcome: sinon.stub() };
        cryptUtilStub = { getHash: sinon.stub() };
        pathUtilityStub = { getMediaFilePath: sinon.stub() };
        userStatServiceStub = { incrementUserStat: sinon.stub().resolves() };
        constantsStub = {};
        loggerStub = { error: sinon.stub() };

        factOrFictionatorCommand = proxyquire('../../commands/simple-text-commands/fact-or-fiction-creator.js', {
            '../../services/fact-or-fiction-service.js': FactOrFictionServiceStub,
            '../../services/fact-or-fiction-outcome-service.js': factOrFictionOutcomeServiceStub,
            '../../utils/crypt-util.js': cryptUtilStub,
            '../../utils/path-util.js': pathUtilityStub,
            '../../services/user-stat-command-service.js': userStatServiceStub,
            '../../utils/constants.js': constantsStub,
            '../../utils/logger.js': loggerStub,
        });

        mockCommandInteraction = {
            options: { getString: sinon.stub() },
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
            reply: sinon.stub(),
            user: { id: 'user-1' },
        };

        constantsStub.FACT_OR_FICTION = {
            VALUES: { FACT: 'fact', FICTION: 'fiction' },
            RESPONSES: [
                { category: 'fact', response: 'fact' },
                { category: 'fiction', response: 'fiction' },
            ],
        };
        constantsStub.STATS = {
            FACT_OR_FICTION: 'fact_or_fiction',
            FACT_OR_FICTION_FRIENDLY: 'figured it out',
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
        cryptUtilStub.getHash.returns({ hash: 'hashed_value' });
        FactOrFictionServiceStub.findOrCreate.resolves([mockFactOrFictionEntry, false]);
        factOrFictionOutcomeServiceStub.resolveFactOrFictionOutcome.returns({
            value: constantsStub.FACT_OR_FICTION.VALUES.FACT,
            response: expectedResponse,
            shouldPersistValue: false,
        });
        pathUtilityStub.getMediaFilePath.returns(expectedAttachmentPath);

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        const expectedContent = `Did you manage to work it out? \nThe story in question: \`${url}\`\n${expectedResponse}\n`;

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith({
            content: expectedContent,
            files: [sinon.match.instanceOf(AttachmentBuilder)],
        });
        expect(userStatServiceStub.incrementUserStat).to.have.been.calledWith(
            'user-1',
            constantsStub.STATS.FACT_OR_FICTION,
            constantsStub.STATS.FACT_OR_FICTION_FRIENDLY
        );
    });

    it('should create a new fact or fiction entry if one does not exist and return a response with attachment', async () => {
        const url = 'https://www.google.com/';
        mockCommandInteraction.options.getString.returns(url);
        cryptUtilStub.getHash.returns({ hash: 'new_hashed_value' });

        const mockFactOrFictionEntry = { dataValues: { value: null }, id: 2 };

        FactOrFictionServiceStub.findOrCreate.resolves([mockFactOrFictionEntry, true]);

        factOrFictionOutcomeServiceStub.resolveFactOrFictionOutcome.returns({
            value: constantsStub.FACT_OR_FICTION.VALUES.FICTION,
            response: 'fiction',
            shouldPersistValue: true,
        });
        pathUtilityStub.getMediaFilePath.returns('path/to/fiction.gif');

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        sinon.assert.calledWith(FactOrFictionServiceStub.update, 2, constantsStub.FACT_OR_FICTION.VALUES.FICTION);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith({
            content: `Did you manage to work it out? \nThe story in question: \`https://www.google.com/\`\nfiction\n`,
            files: [sinon.match.instanceOf(AttachmentBuilder)],
        });
    });

    it('should handle errors', async () => {
        const errorMessage = 'Something went wrong during processing';
        cryptUtilStub.getHash.throws(new Error(errorMessage));

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).to.have.been.calledWith({
            content: 'An error occurred.',
            ephemeral: true,
        });
        expect(loggerStub.error).to.have.been.calledOnce;
    });
});