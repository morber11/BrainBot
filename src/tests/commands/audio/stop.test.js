const proxyquire = require('proxyquire');

describe('Stop command', () => {
    let stopAudioInVoiceChannel;
    let stopCommand;
    let interaction;

    beforeEach(() => {
        stopAudioInVoiceChannel = sinon.stub();
        stopCommand = proxyquire('../../../commands/audio/stop.js', {
            '../../utils/voice-chat-util': { stopAudioInVoiceChannel },
        });
        interaction = {
            guildId: 'guild-id',
            reply: sinon.stub(),
        };
    });

    it('confirms when it stops the current track', async () => {
        stopAudioInVoiceChannel.returns(true);

        await stopCommand.execute(interaction);

        expect(interaction.reply).to.have.been.calledWith('Stopped playback');
    });

    it('reports when there is no active track', async () => {
        stopAudioInVoiceChannel.returns(false);

        await stopCommand.execute(interaction);

        expect(interaction.reply).to.have.been.calledWith('Nothing is playing');
    });
});
