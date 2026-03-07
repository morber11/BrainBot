const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');

const DEFAULT_IDLE_TIMEOUT_MS = process.env.VOICE_IDLE_TIMEOUT_MS ? parseInt(process.env.VOICE_IDLE_TIMEOUT_MS, 10) : 30000;
const logger = require('./logger.js');
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
    const ytHosts = ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'];

    // Prefer ytdl's validator if available
    if (typeof ytdl.validateURL === 'function') {
      return ytdl.validateURL(url);
    }

    return ytHosts.includes(host);
  } catch (err) {
    return false;
  }
}

function cleanupVoiceConnection(guildId) {
  const entry = activeConnections.get(guildId);
  if (!entry) return;

  try {
    if (entry.idleTimer) {
      clearTimeout(entry.idleTimer);
      entry.idleTimer = null;
    }

    if (entry.player) {
      try { entry.player.stop(true); } catch (err) { /* ignore */ }
    }

    if (entry.connection) {
      try { entry.connection.destroy(); } catch (err) { /* ignore */ }
    }
  } finally {
    activeConnections.delete(guildId);
    logger.info(`Cleaned up voice connection for guild ${guildId}`);
  }
}

async function playAudioInVoiceChannel(interaction, url) {
  try {
    if (!isValidAudioUrl(url)) {
      throw new Error('Invalid or unsupported URL. Only YouTube URLs are supported.');
    }

    let stream;
    try {
      stream = ytdl(url, {
        filter: 'audioonly',
        highWaterMark: 1 << 25 // buffer
      });
    } catch (err) {
      throw new Error('Failed to create audio stream from URL: ' + err.message);
    }

    const resource = createAudioResource(stream);

    const guildMember = await interaction.member.guild.members.fetch(interaction.user.id);
    const { channelId } = guildMember.voice;

    if (!channelId) {
      throw new Error('You must join a voice channel first!');
    }

    const guildId = interaction.guildId;

    // Reuse existing connection/player if present
    let entry = activeConnections.get(guildId);
    if (entry) {
      // stop any scheduled teardown
      if (entry.idleTimer) {
        clearTimeout(entry.idleTimer);
        entry.idleTimer = null;
      }

      try {
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
      logger.error('Audio player error for guild', { guildId, error });
      cleanupVoiceConnection(guildId);
    });

    connection.subscribe(player);
    player.play(resource);

    // store connection
    activeConnections.set(guildId, { connection, player, idleTimer: null });

    return;
  } catch (error) {
    throw new Error(`Failed to join or play in voice channel: ${error.message}`);
  }
}

module.exports = { playAudioInVoiceChannel, isValidAudioUrl, cleanupVoiceConnection };
