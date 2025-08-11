const mockDecrementDespair = { start: jest.fn() };
const mockPatriotAct = { start: jest.fn() };
const mockDebug = { start: jest.fn() };

jest.mock('../../../../functions/handlers/cron/decrement-despair-cron', () => mockDecrementDespair);
jest.mock('../../../../functions/handlers/cron/patriot-act-cron', () => jest.fn(() => mockPatriotAct));
jest.mock('../../../../functions/handlers/cron/debug-cron', () => jest.fn(() => mockDebug));

const cronHandler = require('../../../../functions/handlers/cron-handler');

describe('handleCrons', () => {
    let mockClient;

    beforeEach(() => {
        jest.clearAllMocks();
        mockClient = {
            handleCrons: jest.fn(),
            guilds: {
                cache: {
                    values: jest.fn().mockReturnValue([
                        {
                            name: 'Test Guild',
                            channels: {
                                cache: new Map([
                                    ['1', { name: 'general', type: 0, send: jest.fn() }],
                                ]),
                            },
                        },
                    ]),
                },
            },
        };
    });

    it('should start all cron jobs', async () => {
        cronHandler(mockClient);
        await mockClient.handleCrons();
        expect(mockDecrementDespair.start).toHaveBeenCalledTimes(1);
        expect(mockPatriotAct.start).toHaveBeenCalledTimes(1);
        expect(mockDebug.start).not.toHaveBeenCalled(); // we'll keep this for now, debug
    });
});