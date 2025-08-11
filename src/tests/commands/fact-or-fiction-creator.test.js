const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const FactOrFiction = require('../../dal/models/fact-or-fiction.js');
const cryptUtil = require('../../utils/crypt-util.js');
const pathUtility = require('../../utils/path-util.js');
const CONSTANTS = require('../../utils/constants.js');
const stringUtility = require('../../utils/string-util.js');
const factOrFictionatorCommand = require('../../commands/simple-text-commands/fact-or-fiction-creator.js');

jest.mock('../../dal/models/fact-or-fiction.js');
jest.mock('../../utils/crypt-util.js');
jest.mock('../../utils/path-util.js');
jest.mock('../../utils/constants.js');
jest.mock('../../utils/string-util.js');

describe('Fact or Fictionator Command', () => {
    let mockCommandInteraction, originalMathRandom;

    beforeEach(() => {
        originalMathRandom = Math.random;
        Math.random = jest.fn(() => 1.5 / 999);

        mockCommandInteraction = {
            options: {
                getString: jest.fn(),
            },
            deferReply: jest.fn(),
            editReply: jest.fn(),
            reply: jest.fn(),
        };

        CONSTANTS.FACT_OR_FICTION = {
            VALUES: {
                FACT: 'fact',
                FICTION: 'fiction',
            },
            RESPONSES: [
                { category: 'fact', response: 'fact' },
                { category: 'fiction', response: 'fiction' },
            ],
        };
    });

    afterEach(() => {
        Math.random = originalMathRandom;
    });

    it('should reply with the correct fact or fiction result and an attachment', async () => {
        const url = 'https://en.wikipedia.org/wiki/Beyond_Belief:_Fact_or_Fiction';
        const expectedResponse = 'fact';
        const expectedAttachmentPath = 'path/to/fact.gif';

        const mockFactOrFictionEntry = {
            dataValues: { value: CONSTANTS.FACT_OR_FICTION.VALUES.FACT },
            id: 1,
        };

        mockCommandInteraction.options.getString.mockReturnValue(url);
        cryptUtil.getHash.mockResolvedValue('hashed_value');
        FactOrFiction.findOrCreate.mockResolvedValue([mockFactOrFictionEntry, false]);
        stringUtility.selectRandomFromArray.mockReturnValue({ response: expectedResponse });
        pathUtility.getMediaFilePath.mockReturnValue(expectedAttachmentPath);

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        const expectedContent = `Did you manage to work it out? \nThe story in question: \`${url}\`\n${expectedResponse}\n`;

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith({
            content: expectedContent,
            files: [expect.any(AttachmentBuilder)],
        });
    });


    it('should create a new fact or fiction entry if one does not exist and return a response with attachment', async () => {
        const url = 'https://www.google.com/';
        mockCommandInteraction.options.getString.mockReturnValue(url);
        cryptUtil.getHash.mockResolvedValue('new_hashed_value');

        const mockFactOrFictionEntry = {
            dataValues: { value: null },
            id: 2,
        };

        FactOrFiction.findOrCreate.mockResolvedValue([mockFactOrFictionEntry, true]);

        stringUtility.selectRandomFromArray.mockReturnValue({ response: 'fiction' });
        pathUtility.getMediaFilePath.mockReturnValue('path/to/fiction.gif');

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        expect(FactOrFiction.update).toHaveBeenCalledWith(
            { value: CONSTANTS.FACT_OR_FICTION.VALUES.FICTION },
            { where: { id: 2 } }
        );

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith({
            content: `Did you manage to work it out? \nThe story in question: \`https://www.google.com/\`\nfiction\n`,
            files: [expect.any(AttachmentBuilder)],
        });
    });

    it('should reply with a fact or fiction result if the entry already exists', async () => {
        const url = 'https://en.wikipedia.org/wiki/Beyond_Belief:_Fact_or_Fiction';
        mockCommandInteraction.options.getString.mockReturnValue(url);
        cryptUtil.getHash.mockResolvedValue('existing_hashed_value');

        const mockFactOrFictionEntry = {
            dataValues: { value: CONSTANTS.FACT_OR_FICTION.VALUES.FICTION },
            id: 3,
        };

        FactOrFiction.findOrCreate.mockResolvedValue([mockFactOrFictionEntry, false]);
        stringUtility.selectRandomFromArray.mockReturnValue({
            response: 'fiction',
        });
        pathUtility.getMediaFilePath.mockReturnValue('path/to/fiction.gif');

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith({
            content: `Did you manage to work it out? \nThe story in question: \`https://en.wikipedia.org/wiki/Beyond_Belief:_Fact_or_Fiction\`\nfiction\n`,
            files: [expect.any(AttachmentBuilder)],
        });
    });

    it('should handle errors', async () => {
        const errorMessage = 'Something went wrong during processing';
        cryptUtil.getHash.mockRejectedValue(new Error(errorMessage));

        await factOrFictionatorCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).toHaveBeenCalledWith({
            content: 'An error occurred.',
            ephemeral: true,
        });
    });
});