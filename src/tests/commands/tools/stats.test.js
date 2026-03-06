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

    it('should format a table of stats with friendly labels', async () => {
        const sampleRows = [
            { stat: 'patriot_act', count: 5 },
            { stat: 'other', count: 2 },
        ];
        Stat.findAll.mockResolvedValue(sampleRows);

        await statsCommand.execute(mockInteraction);

        // replicate table-building logic so test stays in sync
        const LABELS = { patriot_act: 'number of salutes o7' };
        const data = sampleRows.map(r => ({ label: LABELS[r.stat] || r.stat, count: String(r.count) }));
        const header = { label: 'Command', count: 'Times run' };
        const maxLabel = Math.max(header.label.length, ...data.map(d => d.label.length));
        const maxCount = Math.max(header.count.length, ...data.map(d => d.count.length));
        const pad = (str, len) => str + ' '.repeat(len - str.length);
        let expectedTable = '```\n';
        expectedTable += `${pad(header.label, maxLabel)} | ${pad(header.count, maxCount)}\n`;
        expectedTable += `${'-'.repeat(maxLabel)}-|-${'-'.repeat(maxCount)}\n`;
        data.forEach(d => {
            expectedTable += `${pad(d.label, maxLabel)} | ${pad(d.count, maxCount)}\n`;
        });
        expectedTable += '```';

        expect(mockInteraction.reply).toHaveBeenCalledWith(expectedTable);
    });
});
