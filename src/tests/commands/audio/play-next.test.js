const proxyquire = require('proxyquire');

describe('Play next command', () => {
    let playAudioInVoiceChannel;
    let isValidAudioUrl;
    let getYouTubeTitle;
    let playNextCommand;
    let interaction;

    beforeEach(() => {
        playAudioInVoiceChannel = sinon.stub();
        isValidAudioUrl = sinon.stub();
        getYouTubeTitle = sinon.stub();
        playNextCommand = proxyquire('../../../commands/audio/play-next.js', {
            '../../utils/voice-chat-util': { playAudioInVoiceChannel, isValidAudioUrl },
            '../../services/youtube-audio-service.js': { getYouTubeTitle },
        });
        interaction = {
            options: { getString: sinon.stub().returns('https://youtu.be/video') },
            reply: sinon.stub(),
        };
    });

    it('inserts a video after the current track', async () => {
        isValidAudioUrl.returns(true);
        playAudioInVoiceChannel.resolves({ queued: true });
        getYouTubeTitle.resolves('Video title');

        await playNextCommand.execute(interaction);

        expect(playAudioInVoiceChannel).to.have.been.calledWith(
            interaction,
            'https://youtu.be/video',
            { playNext: true },
        );
        expect(interaction.reply).to.have.been.calledWith({ content: 'Added to queue: Video title' });
    });

    it('starts playback immediately when nothing is playing', async () => {
        isValidAudioUrl.returns(true);
        playAudioInVoiceChannel.resolves({ queued: false });

        await playNextCommand.execute(interaction);

        expect(interaction.reply).to.have.been.calledWith({ content: 'Now playing: https://youtu.be/video' });
        expect(getYouTubeTitle).not.to.have.been.called;
    });
});
