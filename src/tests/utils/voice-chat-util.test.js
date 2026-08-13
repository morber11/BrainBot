const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');

describe('Voice chat utility queue', () => {
    let joinVoiceChannel;
    let createAudioPlayer;
    let createYouTubeAudioStream;
    let voiceChatUtil;
    let players;
    let processes;

    function createInteraction(guildId) {
        return {
            guildId,
            user: { id: 'user-id' },
            channel: { guild: { voiceAdapterCreator: {} } },
            member: {
                guild: {
                    members: {
                        fetch: sinon.stub().resolves({ voice: { channelId: `channel-${guildId}` } }),
                    },
                },
            },
        };
    }

    beforeEach(() => {
        players = [];
        processes = [];
        joinVoiceChannel = sinon.stub().returns({ subscribe: sinon.stub(), destroy: sinon.stub() });
        createAudioPlayer = sinon.stub().callsFake(() => {
            const player = new EventEmitter();
            player.play = sinon.stub();
            player.stop = sinon.stub();
            players.push(player);
            return player;
        });
        createYouTubeAudioStream = sinon.stub().callsFake(() => {
            const process = new EventEmitter();
            process.stdout = new PassThrough();
            process.stdout.write('audio');
            process.stderr = new EventEmitter();
            process.kill = sinon.stub();
            processes.push(process);
            return process;
        });

        voiceChatUtil = proxyquire(require.resolve('../../utils/voice-chat-util.js'), {
            '@discordjs/voice': {
                joinVoiceChannel,
                createAudioPlayer,
                createAudioResource: sinon.stub().returns({}),
                AudioPlayerStatus: { Idle: 'idle', Playing: 'playing' },
                StreamType: { WebmOpus: 'webm-opus' },
            },
            '../services/youtube-audio-service.js': { createYouTubeAudioStream },
        });
    });

    it('plays the next track before the rest of the queue', async () => {
        const firstGuild = createInteraction('first');

        await voiceChatUtil.playAudioInVoiceChannel(firstGuild, 'https://youtu.be/one');
        await voiceChatUtil.playAudioInVoiceChannel(firstGuild, 'https://youtu.be/two');
        await voiceChatUtil.playAudioInVoiceChannel(firstGuild, 'https://youtu.be/next', { playNext: true });

        players[0].emit('stateChange', { status: 'playing' }, { status: 'idle' });

        expect(createYouTubeAudioStream.secondCall).to.have.been.calledWith('https://youtu.be/next');
    });

    it('continues with the next track when the audio process fails', async () => {
        const interaction = createInteraction('guild');

        await voiceChatUtil.playAudioInVoiceChannel(interaction, 'https://youtu.be/one');
        await voiceChatUtil.playAudioInVoiceChannel(interaction, 'https://youtu.be/two');
        processes[0].emit('error', new Error('yt-dlp failed'));

        expect(createYouTubeAudioStream.secondCall).to.have.been.calledWith('https://youtu.be/two');
    });

    it('keeps each guild queue separate', async () => {
        const firstGuild = createInteraction('first');
        const secondGuild = createInteraction('second');

        await voiceChatUtil.playAudioInVoiceChannel(firstGuild, 'https://youtu.be/one');
        await voiceChatUtil.playAudioInVoiceChannel(firstGuild, 'https://youtu.be/two');
        await voiceChatUtil.playAudioInVoiceChannel(secondGuild, 'https://youtu.be/three');
        players[0].emit('stateChange', { status: 'playing' }, { status: 'idle' });

        expect(createYouTubeAudioStream.thirdCall).to.have.been.calledWith('https://youtu.be/two');
    });

    it('stops the current item and starts the next queued track', async () => {
        const interaction = createInteraction('guild');

        await voiceChatUtil.playAudioInVoiceChannel(interaction, 'https://youtu.be/one');
        await voiceChatUtil.playAudioInVoiceChannel(interaction, 'https://youtu.be/two');

        expect(voiceChatUtil.stopAudioInVoiceChannel('guild')).to.equal(true);
        expect(createYouTubeAudioStream.secondCall).to.have.been.calledWith('https://youtu.be/two');
    });

    it('clears pending tracks without stopping the current item', async () => {
        const interaction = createInteraction('guild');

        await voiceChatUtil.playAudioInVoiceChannel(interaction, 'https://youtu.be/one');
        await voiceChatUtil.playAudioInVoiceChannel(interaction, 'https://youtu.be/two');

        expect(voiceChatUtil.clearAudioQueue('guild')).to.equal(true);
        players[0].emit('stateChange', { status: 'playing' }, { status: 'idle' });

        expect(createYouTubeAudioStream).to.have.been.calledOnce;
        expect(voiceChatUtil.clearAudioQueue('guild')).to.equal(false);
    });
});
