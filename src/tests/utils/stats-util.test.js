const statsUtil = require('../../../utils/stats-util.js');

const Stat = require('../../../dal/models/stat.js');
const UserStat = require('../../../dal/models/user-stat.js');

jest.mock('../../../dal/models/stat.js', () => ({
    findOrCreate: jest.fn(),
}));

jest.mock('../../../dal/models/user-stat.js', () => ({
    findOrCreate: jest.fn(),
    update: jest.fn(),
}));

describe('stats-util', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('incrementSystemStat should findOrCreate and increment count', async () => {
        const mockRow = { increment: jest.fn() };
        Stat.findOrCreate.mockResolvedValue([mockRow]);

        const res = await statsUtil.incrementSystemStat('test_stat', 'friendly', 5);

        expect(Stat.findOrCreate).toHaveBeenCalledWith({
            where: { stat: 'test_stat' },
            defaults: { count: 0, friendly_name: 'friendly', sort_order: 5 },
        });
        expect(mockRow.increment).toHaveBeenCalledWith('count');
        expect(res).toBe(mockRow);
    });

    it('incrementUserStat should create row with friendly name and increment', async () => {
        const mockRow = { increment: jest.fn(), id: 1, user_friendly_name: '' };
        UserStat.findOrCreate.mockResolvedValue([mockRow, true]);

        const res = await statsUtil.incrementUserStat('user1', 'brain', 'Brain Friendly');

        expect(UserStat.findOrCreate).toHaveBeenCalledWith({
            where: { userId: 'user1', stat: 'brain' },
            defaults: { count: 0, user_friendly_name: 'Brain Friendly' },
        });
        expect(mockRow.increment).toHaveBeenCalledWith('count');
        expect(res).toBe(mockRow);
    });

    it('incrementUserStat should update friendly name when existing row differs', async () => {
        const mockRow = { increment: jest.fn(), id: 2, user_friendly_name: '' };
        UserStat.findOrCreate.mockResolvedValue([mockRow, false]);

        await statsUtil.incrementUserStat('user2', 'brain', 'New Friendly');

        expect(UserStat.update).toHaveBeenCalledWith({ user_friendly_name: 'New Friendly' }, { where: { id: mockRow.id } });
        expect(mockRow.increment).toHaveBeenCalledWith('count');
    });
});
