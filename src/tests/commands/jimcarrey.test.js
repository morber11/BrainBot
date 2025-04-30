const CustomUrl = require('../../dal/models/custom-url.js');
const stringUtility = require('../../utils/string-util.js');
const jimCarreyCommand = require('../../commands/simple-text-commands/jimcarrey.js');

jest.mock('../../dal/models/custom-url.js');
jest.mock('../../utils/string-util.js');

describe('Jim Carrey Command', () => {
    let mockCommandInteraction;

    beforeEach(() => {
        mockCommandInteraction = {
            deferReply: jest.fn(),
            editReply: jest.fn(),
        };
    });

    it('should reply with a Jim Carrey image when URLs are available', async () => {
        const urls = [{ value: '123', url: 'https://www.w3schools.com/js/jc.jpg' }, { value: '456', url: 'https://www.w3schools.com/js/not-jc.jpg' }];
        CustomUrl.findAll.mockResolvedValue(urls);
        stringUtility.selectRandomFromArray.mockReturnValue(urls[0]);

        await jimCarreyCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('Jim Carrey 123:\nhttps://www.w3schools.com/js/jc.jpg');
    });

    it('should handle when no URLs are available', async () => {
        CustomUrl.findAll.mockResolvedValue([]);

        await jimCarreyCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('No URLs found.');
    });

    it('should handle errors gracefully', async () => {
        CustomUrl.findAll.mockRejectedValue(new Error('Oh no an error'));

        await jimCarreyCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('No URLs found.');
    });
});
