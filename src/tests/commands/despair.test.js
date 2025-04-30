const Member = require('../../dal/models/member.js');
const despairCommand = require('../../commands/simple-text-commands/despair.js');

jest.mock('../../dal/models/member.js');

describe('Despair Command', () => {
    let mockCommandInteraction;

    beforeEach(() => {
        mockCommandInteraction = {
            user: {
                id: '123',
                username: 'testUser',
            },
            deferReply: jest.fn(),
            editReply: jest.fn(),
        };
    });

    it('should create a new member if not exists and reply with despair  count', async () => {
        Member.findOrCreate.mockResolvedValue([{ dataValues: { despairCount: 0 } }, true]);

        await despairCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('Your mental despair is: 0');
    });

    it('should update an existing member and reply with despair count', async () => {
        Member.findOrCreate.mockResolvedValue([{ dataValues: { despairCount: 5 } }, false]);
        Member.update.mockResolvedValue([1]);

        await despairCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).toHaveBeenCalled();
        expect(mockCommandInteraction.editReply).toHaveBeenCalledWith('Your mental despair is: 5');
        expect(Member.update).toHaveBeenCalledWith(
            { name: 'testUser' },
            { where: { id: '123' } }
        );
    });
});
