const stringUtility = require('../../utils/string-util.js');
const gadgetCommand = require('../../commands/simple-text-commands/gadget.js');

jest.mock('../../utils/string-util.js');

describe('Gadget Command', () => {
    let mockCommandInteraction;

    beforeEach(() => {
        mockCommandInteraction = {
            deferReply: jest.fn(),
            editReply: jest.fn(),
        };
    });

    it('should reply with a random gadget item', async () => {
        stringUtility.selectRandomFromArray.mockReturnValue('spoon');

        await gadgetCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('Go Go Gadget spoon!');
    });

    it('should handle errors', async () => {
        stringUtility.selectRandomFromArray.mockImplementation(() => {
            throw new Error('Boom');
        });

        await gadgetCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('An error occurred.');
    });
});
