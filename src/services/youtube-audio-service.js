const { execFile, spawn } = require('node:child_process');

const YT_DLP_COMMAND = process.env.YT_DLP_COMMAND || 'yt-dlp';

function ensureYtDlpAvailable() {
    return new Promise((resolve, reject) => {
        execFile(YT_DLP_COMMAND, ['--version'], (error, stdout) => {
            if (error) {
                reject(new Error('yt-dlp is not available. Set YT_DLP_COMMAND or add yt-dlp to PATH.', { cause: error }));
                return;
            }

            resolve(stdout.trim());
        });
    });
}

function getYouTubeTitle(url) {
    return new Promise((resolve, reject) => {
        execFile(YT_DLP_COMMAND, [
            '--ignore-config',
            '--no-playlist',
            '--print',
            'title',
            '--',
            url,
        ], (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(stdout.trim());
        });
    });
}

function createYouTubeAudioStream(url) {
    return spawn(YT_DLP_COMMAND, [
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
        url,
    ], {
        stdio: ['ignore', 'pipe', 'pipe'],
    });
}

module.exports = { ensureYtDlpAvailable, getYouTubeTitle, createYouTubeAudioStream };
