const stringUtility = require('../../utils/string-util.js');
const CONSTANTS = require('../../utils/constants.js');
const magicBallCommand = require('../../commands/simple-text-commands/magic-ball.js');

jest.mock('../../utils/string-util.js');
jest.mock('../../utils/constants.js');

describe('Magic Ball Command', () => {
    let mockCommandInteraction;

    beforeEach(() => {
        mockCommandInteraction = {
            options: {
                getString: jest.fn(),
            },
            deferReply: jest.fn(),
            editReply: jest.fn(),
        };

        CONSTANTS.MAGIC_BALL = {
            RESPONSES: [{ response: 'Yes, definitely' }, { response: 'Ask again later' }, { response: 'No way' }],
        };
    });

    it('should reply with a random Magic Ball response', async () => {
        const question = 'Will this test work?';
        mockCommandInteraction.options.getString.mockReturnValue(question);
        stringUtility.selectRandomFromArray.mockReturnValue(CONSTANTS.MAGIC_BALL.RESPONSES[0]);

        await magicBallCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith(
            `You have pondered the Magic 9-Ball for guidance\nYour answer is: Yes, definitely.\nYour question was: "Will this test work?"`
        );
    });

    it('should handle errors', async () => {
        stringUtility.selectRandomFromArray.mockImplementation(() => {
            throw new Error('Something went wrong');
        });

        await magicBallCommand.execute(mockCommandInteraction);
        
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('An error occurred.');
    });
});
