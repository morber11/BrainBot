const cron = require('cron');
const debug = require('../../../../../functions/handlers/cron/debug-cron');
const CONSTANTS = require('../../../../../utils/constants');

jest.mock('discord.js', () => ({
    Client: jest.fn().mockImplementation(() => ({
        guilds: {
            cache: {
                values: jest.fn(),
            },
        },
    })),
}));

describe('debug cron', () => {
    let cronJob;
    let mockClient;

    beforeEach(() => {
        jest.clearAllMocks();
        mockClient = new (require('discord.js')).Client();
        cronJob = debug(mockClient);
    });

    it('should handle no guilds gracefully', async () => {
        mockClient.guilds.cache.values.mockReturnValue([]);

        console.log = jest.fn();

        await cronJob.fireOnTick();

        expect(console.log).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
        mockClient.guilds.cache.values.mockImplementation(() => {
            throw new Error('Test Error');
        });

        console.error = jest.fn();

        await cronJob.fireOnTick();

        expect(console.error).toHaveBeenCalledWith('Error while fetching servers or sending messages:', expect.any(Error));
    });
});
