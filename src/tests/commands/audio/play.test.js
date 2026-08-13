const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Play command', () => {
    let playAudioInVoiceChannel;
    let isValidAudioUrl;
    let getYouTubeTitle;
    let playCommand;
    let interaction;

    beforeEach(() => {
        playAudioInVoiceChannel = sinon.stub();
        isValidAudioUrl = sinon.stub();
        getYouTubeTitle = sinon.stub();
        playCommand = proxyquire('../../../commands/audio/play.js', {
            '../../utils/voice-chat-util': { playAudioInVoiceChannel, isValidAudioUrl },
            '../../services/youtube-audio-service.js': { getYouTubeTitle },
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
            content: 'Invalid or unsupported URL. Please provide a valid YouTube URL',
            ephemeral: true,
        });
        expect(playAudioInVoiceChannel).not.to.have.been.called;
    });

    it('confirms immediate playback with the URL', async () => {
        isValidAudioUrl.returns(true);
        playAudioInVoiceChannel.resolves({ queued: false });

        await playCommand.execute(interaction);

        expect(playAudioInVoiceChannel).to.have.been.calledWith(interaction, 'https://youtu.be/video');
        expect(interaction.reply).to.have.been.calledWith({ content: 'Now playing: https://youtu.be/video' });
        expect(getYouTubeTitle).not.to.have.been.called;
    });

    it('confirms queued playback with the video title', async () => {
        isValidAudioUrl.returns(true);
        playAudioInVoiceChannel.resolves({ queued: true });
        getYouTubeTitle.resolves('Video title');

        await playCommand.execute(interaction);

        expect(interaction.reply).to.have.been.calledWith({ content: 'Added to queue: Video title' });
    });

    it('uses the URL when the video title is unavailable', async () => {
        isValidAudioUrl.returns(true);
        playAudioInVoiceChannel.resolves({ queued: true });
        getYouTubeTitle.rejects(new Error('yt-dlp failed'));

        await playCommand.execute(interaction);

        expect(interaction.reply).to.have.been.calledWith({ content: 'Added to queue: https://youtu.be/video' });
    });
});
