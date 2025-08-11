const cron = require('cron');
const decrementDespair = require('../../../../../functions/handlers/cron/decrement-despair-cron');
const Member = require('../../../../../dal/models/member');
const CONSTANTS = require('../../../../../utils/constants');

jest.mock('../../../../../dal/models/member', () => ({
    findAll: jest.fn(),
    update: jest.fn(),
}));

describe('decrement dspair', () => {
    let cronJob;

    beforeEach(() => {
        jest.clearAllMocks();
        cronJob = decrementDespair;
    });

    it('should decrement despairCount for members with positive despairCount', async () => {
        const mockMembers = [
            { id: 1, despairCount: 5, increment: jest.fn() },
            { id: 2, despairCount: 3, increment: jest.fn() },
        ];

        Member.findAll.mockResolvedValue(mockMembers);

        await cronJob.fireOnTick();

        mockMembers.forEach((member) => {
            if (member.despairCount > 0) {
                expect(member.increment).toHaveBeenCalledWith({
                    despairCount: CONSTANTS.POINT_VALUES.DESPAIR_DECREMENT,
                });
            }
        });
    });

    it('should reset despairCount to 0 for members with negative despairCount', async () => {
        const mockMembers = [
            { id: 3, despairCount: -1, increment: jest.fn() },
            { id: 4, despairCount: -5, increment: jest.fn() },
        ];

        Member.findAll.mockResolvedValue(mockMembers);

        await cronJob.fireOnTick();

        mockMembers.forEach((member) => {
            if (member.despairCount < 0) {
                expect(Member.update).toHaveBeenCalledWith(
                    { despairCount: 0, updatedAt: expect.any(Date) },
                    { where: { id: member.id } }
                );
            }
        });
    });

    it('should handle no members found gracefully', async () => {
        Member.findAll.mockResolvedValue([]);

        await cronJob.fireOnTick();

        expect(Member.update).not.toHaveBeenCalled();
    });
});
