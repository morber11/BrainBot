const cron = require('cron');
const patriotAct = require('../../../../../functions/handlers/cron/patriot-act-cron');
const CONSTANTS = require('../../../../../utils/constants');

const mockSend = jest.fn();
const mockFind = jest.fn();
const mockGuildsCacheValues = jest.fn();
const mockStatIncrement = jest.fn();

jest.mock('discord.js', () => ({
    Client: jest.fn().mockImplementation(() => ({
        guilds: {
            cache: {
                values: mockGuildsCacheValues,
            },
        },
    })),
    TextChannel: jest.fn().mockImplementation(() => ({
        send: mockSend,
    })),
}));

jest.mock('../../../../../dal/models/stat', () => ({
    findOrCreate: jest.fn(),
}));

const Stat = require('../../../../../dal/models/stat');

describe('patriot act', () => {
    let cronJob;
    let mockClient;

    beforeEach(() => {
        jest.clearAllMocks();
        Stat.findOrCreate.mockResolvedValue([{ increment: mockStatIncrement }]);

        mockClient = new (require('discord.js')).Client();
        cronJob = patriotAct(mockClient);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('should send message to target channel when found', async () => {
        const mockChannel = { type: 0, name: '2fort', send: mockSend };
        const mockGuild = {
            channels: {
                cache: {
                    find: mockFind,
                },
            },
        };

        mockFind.mockReturnValue(mockChannel);
        mockGuildsCacheValues.mockReturnValue([mockGuild]);

        await cronJob.fireOnTick();

        await jest.advanceTimersByTimeAsync(CONSTANTS.CRON.PATRIOT_ACT_DELAY_PERIOD);
        expect(mockFind).toHaveBeenCalledTimes(1);
        expect(mockSend).toHaveBeenCalledWith('o7');
        expect(Stat.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
            where: { stat: CONSTANTS.STATS.PATRIOT_ACT },
            defaults: expect.objectContaining({ count: 0 }),
        }));
        expect(mockStatIncrement).toHaveBeenCalledWith('count');
    });

    it('should fall back to "bot/general" channel if specified channel is not found', async () => {
        const mockBotChannel = { type: 0, name: 'bot', send: mockSend };
        const mockGuild = {
            channels: {
                cache: {
                    find: mockFind,
                },
            },
        };

        mockFind.mockReturnValueOnce(null).mockReturnValueOnce(mockBotChannel);
        mockGuildsCacheValues.mockReturnValue([mockGuild]);

        await cronJob.fireOnTick();

        await jest.advanceTimersByTimeAsync(CONSTANTS.CRON.PATRIOT_ACT_DELAY_PERIOD);
        expect(mockFind).toHaveBeenCalledTimes(2);
        expect(mockSend).toHaveBeenCalledWith('o7');
        expect(Stat.findOrCreate).toHaveBeenCalled();
        expect(mockStatIncrement).toHaveBeenCalledWith('count');
    });

    it('should handle errors gracefully', async () => {
        const mockGuild = {
            channels: {
                cache: {
                    find: mockFind,
                },
            },
        };

        mockFind.mockImplementation(() => {
            throw new Error('Test Error');
        });
        mockGuildsCacheValues.mockReturnValue([mockGuild]);

        console.error = jest.fn();

        await cronJob.fireOnTick();

        await jest.advanceTimersByTimeAsync(CONSTANTS.CRON.PATRIOT_ACT_DELAY_PERIOD);
        expect(console.error).toHaveBeenCalledWith('Error fetching servers or sending message:', expect.any(Error));
        expect(mockStatIncrement).not.toHaveBeenCalled();
    });
});
