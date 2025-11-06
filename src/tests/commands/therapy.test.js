const therapyCommand = require('../../commands/simple-text-commands/therapy.js');

describe('Therapy Command', () => {
    let mockCommandInteraction;

    beforeEach(() => {
        mockCommandInteraction = {
            deferReply: jest.fn(),
            editReply: jest.fn(),
        };
    });

    it('should reply with pls rember', async () => {
        await therapyCommand.execute(mockCommandInteraction);

        const expected = [
            'pls rember that wen u feel scare or frigten',
            'never forget ttimes wen u feeled happy',
            '',
            'wen day is dark alway rember happy day',
            '',
            'https://youtu.be/x6LovY_DdEE?si=bv3gjBJyXuVc7U-u',
        ].join('\n');

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith(expected);
    });

    it('should handle errors', async () => {
        mockCommandInteraction.deferReply.mockImplementation(() => { throw new Error('boom'); });

        await therapyCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('An error occurred.');
    });
});
