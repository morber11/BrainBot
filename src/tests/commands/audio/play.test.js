const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Play command', () => {
    let playAudioInVoiceChannel;
    let isValidAudioUrl;
    let playCommand;
    let interaction;

    beforeEach(() => {
        playAudioInVoiceChannel = sinon.stub();
        isValidAudioUrl = sinon.stub();
        playCommand = proxyquire('../../../commands/audio/play.js', {
            '../../utils/voice-chat-util': { playAudioInVoiceChannel, isValidAudioUrl },
        });
        interaction = {
            options: { getString: sinon.stub().returns('https://youtu.be/video') },
            reply: sinon.stub(),
        };
    });

    it('rejects unsupported URLs', async () => {
        isValidAudioUrl.returns(false);

        await playCommand.execute(interaction);

        expect(interaction.reply).to.have.been.calledWith({
            content: 'Invalid or unsupported URL. Please provide a valid YouTube URL.',
            ephemeral: true,
        });
        expect(playAudioInVoiceChannel).not.to.have.been.called;
    });

    it('plays valid URLs and confirms playback', async () => {
        isValidAudioUrl.returns(true);

        await playCommand.execute(interaction);

        expect(playAudioInVoiceChannel).to.have.been.calledWith(interaction, 'https://youtu.be/video');
        expect(interaction.reply).to.have.been.calledWith({ content: 'Now playing: https://youtu.be/video' });
    });
});
