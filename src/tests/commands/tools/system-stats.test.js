const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Stats Command', () => {
    let statsCommand;
    let StatStub;
    let mockInteraction;

    beforeEach(() => {
        StatStub = { findAll: sinon.stub() };
        statsCommand = proxyquire('../../../commands/tools/system-stats.js', {
            '../../dal/models/stat.js': StatStub,
        });

        mockInteraction = {
            reply: sinon.stub(),
        };
    });

    it('should always append hardcoded rows', async () => {
        const sampleRows = [
            { stat: 'patriot_act', count: 5, friendly_name: "times i've saluted" },
            { stat: 'other', count: 2, friendly_name: '' },
        ];
        StatStub.findAll.resolves(sampleRows);

        await statsCommand.execute(mockInteraction);

        const entries = sampleRows.map(r => ({ label: r.friendly_name || r.stat, value: String(r.count) }));
        entries.unshift({ label: "times i asked", value: '0' });
        const expectedTable = `\`\`\`\n${statsCommand.generateStatsTable(entries)}\`\`\``;

        expect(mockInteraction.reply).to.have.been.calledWith(expectedTable);
    });
});
