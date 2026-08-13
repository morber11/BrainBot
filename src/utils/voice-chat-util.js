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

function cleanupVoiceConnection(guildId) {
    const entry = activeConnections.get(guildId);
    if (!entry) return;

    activeConnections.delete(guildId);

    try {
        if (entry.idleTimer) {
            clearTimeout(entry.idleTimer);
            entry.idleTimer = null;
        }

        if (entry.audioProcess) {
            try { entry.audioProcess.kill(); } catch (err) { /* ignore */ }
        }

        try { entry.player.stop(true); } catch (err) { /* ignore */ }
        try { entry.connection.destroy(); } catch (err) { /* ignore */ }
    } finally {
        logger.info(`Cleaned up voice connection for guild ${guildId}`);
    }
}

async function playAudioInVoiceChannel(interaction, url) {
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

        let audioProcess;
        try {
            const cleanUrl = url.trim().replace(/['"]+$/, '');
            audioProcess = createYouTubeAudioStream(cleanUrl);
        } catch (err) {
            throw new Error('failed to create audio stream', { cause: err });
        }

        const resource = createAudioResource(audioProcess.stdout, { inputType: StreamType.WebmOpus });

        // Reuse existing connection/player if present
        const entry = activeConnections.get(guildId);
        if (entry) {
            // stop any scheduled teardown
            if (entry.idleTimer) {
                clearTimeout(entry.idleTimer);
                entry.idleTimer = null;
            }

            try {
                if (entry.audioProcess) {
                    entry.audioProcess.kill();
                }

                entry.audioProcess = audioProcess;
                entry.player.play(resource);
                return;
            } catch (err) {
                // if reuse fails, cleanup and continue to create new
                logger.error('Error reusing existing player, cleaning up and recreating:', err);
                cleanupVoiceConnection(guildId);
            }
        }

        const connection = joinVoiceChannel({
            channelId: channelId,
            guildId: guildId,
            adapterCreator: interaction.channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();

        // Listen for state changes to schedule cleanup when idle
        player.on('stateChange', (oldState, newState) => {
            if (oldState.status !== newState.status) {
                if (newState.status === AudioPlayerStatus.Idle) {
                    // schedule cleanup
                    const timer = setTimeout(() => cleanupVoiceConnection(guildId), DEFAULT_IDLE_TIMEOUT_MS);
                    const cur = activeConnections.get(guildId) || {};
                    cur.idleTimer = timer;
                    activeConnections.set(guildId, cur);
                } else if (newState.status === AudioPlayerStatus.Playing) {
                    // clear idle timer when playback resumes
                    const cur = activeConnections.get(guildId);
                    if (cur && cur.idleTimer) {
                        clearTimeout(cur.idleTimer);
                        cur.idleTimer = null;
                        activeConnections.set(guildId, cur);
                    }
                }
            }
        });

        player.on('error', (error) => {
            logger.error('Audio player error for guild', guildId, error);
            cleanupVoiceConnection(guildId);
        });

        audioProcess.on('error', (error) => {
            logger.error('yt-dlp process error for guild', guildId, error);
            cleanupVoiceConnection(guildId);
        });

        audioProcess.on('close', (code) => {
            if (code !== 0) {
                logger.error(`yt-dlp exited with code ${code} for guild ${guildId}`);
                cleanupVoiceConnection(guildId);
            }
        });

        connection.subscribe(player);
        player.play(resource);

        // store connection
        activeConnections.set(guildId, { connection, player, audioProcess, idleTimer: null });

        return;
    } catch (error) {
        throw new Error('Failed to join or play in voice channel', { cause: error });
    }
}

module.exports = { playAudioInVoiceChannel, isValidAudioUrl, cleanupVoiceConnection };