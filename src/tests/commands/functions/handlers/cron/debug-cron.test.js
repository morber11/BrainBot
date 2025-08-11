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

    it('should log guild name and channels', async () => {
        const mockGuild = {
            name: 'Test Guild',
            channels: {
                cache: {
                    map: jest.fn().mockReturnValue(['general', 'bot', '2fort']),
                },
            },
        };

        mockClient.guilds.cache.values.mockReturnValue([mockGuild]);

        console.log = jest.fn();

        await cronJob.fireOnTick();

        expect(console.log).toHaveBeenCalledWith('Guild: Test Guild');
        expect(console.log).toHaveBeenCalledWith('Channels in the guild:');
        expect(console.log).toHaveBeenCalledWith('general, bot, 2fort');
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
