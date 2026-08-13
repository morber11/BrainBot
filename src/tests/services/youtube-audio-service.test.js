const childProcess = require('node:child_process');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('YouTube audio service', () => {
    let execFileStub;
    let spawnStub;
    let youtubeAudioService;

    beforeEach(() => {
        execFileStub = sinon.stub();
        spawnStub = sinon.stub();

        youtubeAudioService = proxyquire('../../services/youtube-audio-service.js', {
            'node:child_process': {
                ...childProcess,
                execFile: execFileStub,
                spawn: spawnStub,
            },
        });
    });

    it('checks that yt-dlp is available', async () => {
        execFileStub.callsFake((command, args, callback) => callback(null, '2026.07.04\n'));

        const version = await youtubeAudioService.ensureYtDlpAvailable();

        expect(version).to.equal('2026.07.04');
        expect(execFileStub).to.have.been.calledWith('yt-dlp', ['--version']);
    });

    it('reports when yt-dlp is unavailable', async () => {
        const cause = new Error('not found');
        execFileStub.callsFake((command, args, callback) => callback(cause));

        try {
            await youtubeAudioService.ensureYtDlpAvailable();
            throw new Error('expected the availability check to fail');
        } catch (error) {
            expect(error).to.be.instanceOf(Error);
            expect(error.cause).to.equal(cause);
        }
    });

    it('gets the title for a single YouTube video', async () => {
        execFileStub.callsFake((command, args, callback) => callback(null, 'Video title\n'));

        const title = await youtubeAudioService.getYouTubeTitle('https://youtu.be/video');

        expect(title).to.equal('Video title');
        expect(execFileStub).to.have.been.calledWith('yt-dlp', [
            '--ignore-config',
            '--no-playlist',
            '--print',
            'title',
            '--',
            'https://youtu.be/video',
        ]);
    });

    it('spawns yt-dlp for a single WebM Opus stream', () => {
        const child = { stdout: {}, stderr: {} };
        spawnStub.returns(child);

        const result = youtubeAudioService.createYouTubeAudioStream('https://youtu.be/video');

        expect(result).to.equal(child);
        expect(spawnStub).to.have.been.calledWith('yt-dlp', [
            '--ignore-config',
            '--no-playlist',
            '--quiet',
            '--format',
            'bestaudio[ext=webm][acodec=opus]',
            '--output',
            '-',
            '--js-runtimes',
            'node',
            '--',
            'https://youtu.be/video',
        ], { stdio: ['ignore', 'pipe', 'pipe'] });
    });
});
