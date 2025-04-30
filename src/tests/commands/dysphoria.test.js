const CustomUrl = require('../../dal/models/custom-url.js');
const stringUtility = require('../../utils/string-util.js');
const dysphoriaCommand = require('../../commands/simple-text-commands/dysphoria.js');

jest.mock('../../dal/models/custom-url.js');
jest.mock('../../utils/string-util.js');

describe('Dysphoria Command', () => {
    let mockCommandInteraction;

    beforeEach(() => {
        mockCommandInteraction = {
            deferReply: jest.fn(),
            editReply: jest.fn(),
        };
    });

    it('should reply with a URL when URLs are available', async () => {
        const urls = [{ url: 'https://www.w3schools.com/js/' }, { url: 'https://google.com/' }];
        CustomUrl.findAll.mockResolvedValue(urls);
        stringUtility.selectRandomFromArray.mockReturnValue(urls[0]);

        await dysphoriaCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('https://www.w3schools.com/js/');
    });

    it('should handle when no URLs are available', async () => {
        CustomUrl.findAll.mockResolvedValue([]);

        await dysphoriaCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('No URLs found.');
    });

    it('should handle errors', async () => {
        CustomUrl.findAll.mockRejectedValue(new Error("Oh no an error"));

        await dysphoriaCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('No URLs found.');
    });
});
