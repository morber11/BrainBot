const stringUtility = require('../../utils/string-util.js');
const brainCommand = require('../../commands/simple-text-commands/brain.js');

jest.mock('../../utils/string-util.js');

describe('Brain Command', () => {
    let mockCommandInteraction;

    beforeEach(() => {
        mockCommandInteraction = {
            options: {
                getString: jest.fn(),
            },
            reply: jest.fn(),
        };
    });

    it('should reply with the correct number of brains when a valid number is provided', async () => {
        const numBrains = '5';
        mockCommandInteraction.options.getString.mockReturnValue(numBrains);
        stringUtility.isNumeric.mockReturnValue(true);

        await brainCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).toHaveBeenCalledWith('brain brain brain brain brain');
    });

    it('should limit the number of brains', async () => {
        const numBrains = '400';
        mockCommandInteraction.options.getString.mockReturnValue(numBrains);
        stringUtility.isNumeric.mockReturnValue(true);

        await brainCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).toHaveBeenCalledWith('brain '.repeat(330).trimEnd());
    });

    it('should handle non-numeric input by returning default', async () => {
        const numBrains = 'not-a-number';
        mockCommandInteraction.options.getString.mockReturnValue(numBrains);
        stringUtility.isNumeric.mockReturnValue(false);

        await brainCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).toHaveBeenCalledWith('brain brain brain brain');
    });

    it('should handle 0 brains', async () => {
        const numBrains = '0';
        mockCommandInteraction.options.getString.mockReturnValue(numBrains);
        stringUtility.isNumeric.mockReturnValue(true);

        await brainCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.reply).toHaveBeenCalledWith('');
    });
});
