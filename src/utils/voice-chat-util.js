const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const { createYouTubeAudioStream } = require('../services/youtube-audio-service.js');
const logger = require('./logger.js');

const DEFAULT_IDLE_TIMEOUT_MS = process.env.VOICE_IDLE_TIMEOUT_MS ? parseInt(process.env.VOICE_IDLE_TIMEOUT_MS, 10) : 30000;
const activeConnections = new Map();

function isValidAudioUrl(url) {
    if (!url || typeof url !== 'string' || url.length > 2048) {
        return false;
    }

    try {
        const parsed = new URL(url);

        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false;
        }
        const host = parsed.hostname.toLowerCase();
        const ytHosts = ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com', 'music.youtube.com'];

        return ytHosts.includes(host);
    } catch (err) {
        return false;
    }
}

function clearIdleTimer(entry) {
    if (entry.idleTimer) {
        clearTimeout(entry.idleTimer);
        entry.idleTimer = null;
    }
}

function cleanupVoiceConnection(guildId) {
    const entry = activeConnections.get(guildId);
    if (!entry) return;

    activeConnections.delete(guildId);
    clearIdleTimer(entry);

    if (entry.audioProcess) {
        try { entry.audioProcess.kill(); } catch (err) { /* ignore */ }
    }

    try { entry.player.stop(true); } catch (err) { /* ignore */ }
    try { entry.connection.destroy(); } catch (err) { /* ignore */ }

    logger.info(`Cleaned up voice connection for guild ${guildId}`);
}

function scheduleCleanup(guildId, entry) {
    clearIdleTimer(entry);
    entry.idleTimer = setTimeout(() => cleanupVoiceConnection(guildId), DEFAULT_IDLE_TIMEOUT_MS);
}

function isActiveVoiceEntry(guildId, entry) {
    return activeConnections.get(guildId) === entry;
}

function finishCurrentTrack(guildId, entry) {
    if (!isActiveVoiceEntry(guildId, entry) || !entry.currentUrl) return;

    const audioProcess = entry.audioProcess;
    entry.audioProcess = null;
    entry.currentUrl = null;

    if (audioProcess) {
        try { audioProcess.kill(); } catch (err) { /* ignore */ }
    }

    try { entry.player.stop(true); } catch (err) { /* ignore */ }
    startNextTrack(guildId, entry);
}

function waitForAudioStream(audioProcess) {
    return new Promise((resolve, reject) => {
        let errorOutput = '';

        function removeListeners() {
            audioProcess.stdout.off('data', onData);
            audioProcess.stderr.off('data', onErrorOutput);
            audioProcess.off('error', onError);
            audioProcess.off('close', onClose);
        }

        function onData() {
            removeListeners();
            resolve();
        }

        function onError(error) {
            removeListeners();
            reject(error);
        }

        function onErrorOutput(chunk) {
            errorOutput += chunk;
        }

        function onClose(code) {
            removeListeners();
            reject(new Error(`yt-dlp exited with code ${code}: ${errorOutput.trim()}`));
        }

        audioProcess.stdout.once('data', onData);
        audioProcess.stderr.on('data', onErrorOutput);
        audioProcess.once('error', onError);
        audioProcess.once('close', onClose);
    });
}

function monitorAudioProcess(guildId, entry, audioProcess) {
    let errorOutput = '';
    audioProcess.stderr.on('data', (chunk) => {
        errorOutput += chunk;
    });

    audioProcess.on('error', (error) => {
        if (!isActiveVoiceEntry(guildId, entry)) return;
        if (entry.audioProcess !== audioProcess) return;

        logger.error(`yt-dlp process error for guild ${guildId}:`, error);
        finishCurrentTrack(guildId, entry);
    });

    audioProcess.on('close', (code) => {
        if (code === 0) return;
        if (!isActiveVoiceEntry(guildId, entry)) return;
        if (entry.audioProcess !== audioProcess) return;

        logger.error(`yt-dlp exited with code ${code} for guild ${guildId}: ${errorOutput.trim()}`);
        finishCurrentTrack(guildId, entry);
    });
}

async function startTrack(guildId, entry, url) {
    let audioProcess;
    try {
        const cleanUrl = url.trim().replace(/['"]+$/, '');
        audioProcess = createYouTubeAudioStream(cleanUrl);
        const resource = createAudioResource(audioProcess.stdout, { inputType: StreamType.WebmOpus });

        entry.audioProcess = audioProcess;
        entry.currentUrl = url;

        const audioReady = waitForAudioStream(audioProcess);
        entry.player.play(resource);

        await audioReady;
        monitorAudioProcess(guildId, entry, audioProcess);
    } catch (error) {
        if (entry.audioProcess === audioProcess) {
            entry.audioProcess = null;
            entry.currentUrl = null;
        }

        throw error;
    }
}

async function startNextTrack(guildId, entry) {
    if (!isActiveVoiceEntry(guildId, entry) || entry.currentUrl) return false;

    const url = entry.queue.shift();
    if (!url) {
        scheduleCleanup(guildId, entry);
        return false;
    }

    clearIdleTimer(entry);
    try {
        await startTrack(guildId, entry, url);
        return true;
    } catch (error) {
        logger.error(`Failed to start audio for guild ${guildId}:`, error);
        return startNextTrack(guildId, entry);
    }
}


function createVoiceEntry(guildId, channelId, adapterCreator) {
    const connection = joinVoiceChannel({ channelId, guildId, adapterCreator });
    const player = createAudioPlayer();
    const entry = {
        connection,
        player,
        audioProcess: null,
        currentUrl: null,
        queue: [],
        idleTimer: null,
    };

    player.on('stateChange', (oldState, newState) => {
        if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
            finishCurrentTrack(guildId, entry);
        } else if (newState.status === AudioPlayerStatus.Playing) {
            clearIdleTimer(entry);
        }
    });

    player.on('error', (error) => {
        logger.error(`Audio player error for guild ${guildId}:`, error);
        finishCurrentTrack(guildId, entry);
    });

    connection.subscribe(player);
    activeConnections.set(guildId, entry);
    return entry;
}

async function playAudioInVoiceChannel(interaction, url, { playNext = false } = {}) {
    try {
        if (!isValidAudioUrl(url)) {
            throw new Error('Invalid or unsupported URL. Only YouTube URLs are supported.');
        }

        const guildMember = await interaction.member.guild.members.fetch(interaction.user.id);
        const { channelId } = guildMember.voice;

        if (!channelId) {
            throw new Error('You must join a voice channel first!');
        }

        const guildId = interaction.guildId;
        const entry = activeConnections.get(guildId)
            || createVoiceEntry(guildId, channelId, interaction.channel.guild.voiceAdapterCreator);
        const wasPlaying = Boolean(entry.currentUrl);

        if (playNext) {
            entry.queue.unshift(url);
        } else {
            entry.queue.push(url);
        }

        if (!wasPlaying) {
            const started = await startNextTrack(guildId, entry);
            if (!started) {
                throw new Error('Failed to start audio');
            }
        }

        return { queued: wasPlaying };
    } catch (error) {
        throw new Error('Failed to join or play in voice channel', { cause: error });
    }
}

function stopAudioInVoiceChannel(guildId) {
    const entry = activeConnections.get(guildId);
    if (!entry || !entry.currentUrl) return false;

    finishCurrentTrack(guildId, entry);
    return true;
}

function clearAudioQueue(guildId) {
    const entry = activeConnections.get(guildId);
    if (!entry || entry.queue.length === 0) return false;

    entry.queue.length = 0;
    return true;
}

module.exports = {
    playAudioInVoiceChannel,
    stopAudioInVoiceChannel,
    clearAudioQueue,
    isValidAudioUrl,
    cleanupVoiceConnection,
};
