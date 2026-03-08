const statsCommand = require('../../../commands/tools/stats.js');
const Stat = require('../../../dal/models/stat.js');

jest.mock('../../../dal/models/stat.js');

describe('Stats Command', () => {
    let mockInteraction;

    beforeEach(() => {
        mockInteraction = {
            reply: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it('should inform when no stats exist', async () => {
        Stat.findAll.mockResolvedValue([]);

        await statsCommand.execute(mockInteraction);

        expect(mockInteraction.reply).toHaveBeenCalledWith('There are no statistics recorded yet.');
    });

    it('should always append hardcoded rows', async () => {
        const sampleRows = [
            { stat: 'patriot_act', count: 5, friendly_name: "times i've saluted" },
            { stat: 'other', count: 2, friendly_name: '' },
        ];
        Stat.findAll.mockResolvedValue(sampleRows);

        await statsCommand.execute(mockInteraction);

        const entries = sampleRows.map(r => ({ label: r.friendly_name || r.stat, value: String(r.count) }));
        entries.unshift({ label: "times i asked", value: '0' });
        const expectedTable = `\`\`\`\n${statsCommand.generateStatsTable(entries)}\`\`\``;

        expect(mockInteraction.reply).toHaveBeenCalledWith(expectedTable);
    });
});
