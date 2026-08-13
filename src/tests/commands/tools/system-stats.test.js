const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Stats Command', () => {
    let statsCommand;
    let systemStatQueryStub;
    let mockInteraction;

    beforeEach(() => {
        systemStatQueryStub = { findAll: sinon.stub() };
        statsCommand = proxyquire('../../../commands/tools/system-stats.js', {
            '../../services/system-stat-query-service.js': systemStatQueryStub,
        });

        mockInteraction = {
            reply: sinon.stub(),
        };
    });

    it('includes the hardcoded ask row with queried statistics', async () => {
        const sampleRows = [
            { stat: 'patriot_act', count: 5, friendly_name: "times i've saluted" },
            { stat: 'other', count: 2, friendly_name: '' },
        ];
        systemStatQueryStub.findAll.resolves(sampleRows);

        await statsCommand.execute(mockInteraction);

        const reply = mockInteraction.reply.firstCall.args[0];

        expect(reply).to.match(/^```\n/);
        expect(reply).to.include('times i asked');
        expect(reply).to.include('0');
        expect(reply).to.include("times i've saluted");
        expect(reply).to.include('5');
        expect(reply).to.match(/\n```$/);
    });
});
