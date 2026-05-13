const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Spooks-wisdom Command', () => {
    let mockCommandInteraction;
    let stringUtilityStub;
    let pathUtilityStub;
    let statsStub;
    let userStatsStub;
    let spookswisdomCommand;

    beforeEach(() => {
        stringUtilityStub = { selectRandomFromArray: sinon.stub() };
        pathUtilityStub = { getMediaFilePath: sinon.stub().returns('fake/path/spookswisdom/1.jpg') };
        statsStub = { incrementSystemStat: sinon.stub().resolves() };
        userStatsStub = { incrementUserStat: sinon.stub().resolves() };

        spookswisdomCommand = proxyquire('../../commands/simple-text-commands/spooks-wisdom.js', {
            '../../utils/string-util.js': stringUtilityStub,
            '../../utils/path-util.js': pathUtilityStub,
            '../../services/system-stat-service.js': statsStub,
            '../../services/user-stat-service.js': userStatsStub,
        });

        mockCommandInteraction = {
            deferReply: sinon.stub(),
            editReply: sinon.stub(),
            user: { id: 'u1' },
            guildId: 'g1',
        };
    });

    it('should reply with a random master gregory quote', async () => {
        stringUtilityStub.selectRandomFromArray.returns({ id: 1, phrase: 'The trick is not to spill', file: '1.jpg' });

        await spookswisdomCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.deferReply).to.have.been.called;
        expect(mockCommandInteraction.editReply).to.have.been.calledWith({ content: '*The trick is not to spill*', files: ['fake/path/spookswisdom/1.jpg'] });
        const CONSTANTS = require('../../utils/constants.js');
        expect(statsStub.incrementSystemStat).to.have.been.calledWith(CONSTANTS.STATS.SPOOKS_WISDOM, CONSTANTS.STATS.SPOOKS_WISDOM_FRIENDLY);
        expect(userStatsStub.incrementUserStat).to.have.been.calledWith('u1', CONSTANTS.STATS.SPOOKS_WISDOM, CONSTANTS.STATS.SPOOKS_WISDOM_FRIENDLY);
    });

    it('should handle errors', async () => {
        stringUtilityStub.selectRandomFromArray.throws(new Error('Boom'));

        await spookswisdomCommand.execute(mockCommandInteraction);

        expect(mockCommandInteraction.editReply).to.have.been.calledWith('An error occurred.');
    });
});
