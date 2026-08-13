const proxyquire = require('proxyquire');

describe('Clear queue command', () => {
    let clearAudioQueue;
    let clearQueueCommand;
    let interaction;

    beforeEach(() => {
        clearAudioQueue = sinon.stub();
        clearQueueCommand = proxyquire('../../../commands/audio/clear-queue.js', {
            '../../utils/voice-chat-util': { clearAudioQueue },
        });
        interaction = {
            guildId: 'guild-id',
            reply: sinon.stub(),
        };
    });

    it('confirms when it clears pending tracks', async () => {
        clearAudioQueue.returns(true);

        await clearQueueCommand.execute(interaction);

        expect(interaction.reply).to.have.been.calledWith('Cleared queue');
    });

    it('reports when there are no pending tracks', async () => {
        clearAudioQueue.returns(false);

        await clearQueueCommand.execute(interaction);

        expect(interaction.reply).to.have.been.calledWith('The queue is empty');
    });
});
