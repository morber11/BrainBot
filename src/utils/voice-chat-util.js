const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { Innertube, UniversalCache, Platform } = require('youtubei.js');
const { Readable } = require('stream');

const DEFAULT_IDLE_TIMEOUT_MS = process.env.VOICE_IDLE_TIMEOUT_MS ? parseInt(process.env.VOICE_IDLE_TIMEOUT_MS, 10) : 30000;
const activeConnections = new Map();

if (Platform?.shim && typeof Platform.shim.eval === 'function') {
  Platform.shim.eval = async (data, env) => {
    const properties = [];

    if (typeof env?.n === 'string') {
      properties.push(`n: exportedVars.nFunction(${JSON.stringify(env.n)})`);
    }

    if (typeof env?.sig === 'string') {
      properties.push(`sig: exportedVars.sigFunction(${JSON.stringify(env.sig)})`);
    }

    const code = `${data.output}\nreturn { ${properties.join(', ')} };`;
    return new Function(code)();
  };
}

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
    console.log(`Cleaned up voice connection for guild ${guildId}`);
  }
}

function extractYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0];
      return id || null;
    }

    if (host.endsWith('youtube.com')) {
      const fromQuery = parsed.searchParams.get('v');
      if (fromQuery) return fromQuery;

      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live')) {
        return parts[1];
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}

async function playAudioInVoiceChannel(interaction, url) {
  try {
    if (!isValidAudioUrl(url)) {
      throw new Error('Invalid or unsupported URL. Only YouTube URLs are supported.');
    }

    let stream;
    try {
      const youtube = await Innertube.create({ cache: new UniversalCache(false) });

      const cleanUrl = url.trim().replace(/['"]+$/, '');
      let videoId = extractYouTubeVideoId(cleanUrl);

      if (!videoId) {
        const endpoint = await youtube.resolveURL(cleanUrl);
        videoId = endpoint?.payload?.videoId;
      }

      if (!videoId) {
        throw new Error('Could not resolve a YouTube video id from the provided URL.');
      }

      const clientFallbacks = ['IOS', 'ANDROID', 'WEB_EMBEDDED', 'WEB'];
      let info = null;
      let lastGetInfoError = null;

      for (const client of clientFallbacks) {
        try {
          info = await youtube.getInfo(videoId, client);
          break;
        } catch (clientErr) {
          lastGetInfoError = clientErr;
        }
      }

      if (!info) {
        throw (lastGetInfoError || new Error('Failed to get video info from YouTube.'));
      }

      const streamingData = info.streaming_data;
      const allFormats = [
        ...(streamingData?.formats || []),
        ...(streamingData?.adaptive_formats || [])
      ];

      const audioCandidates = allFormats
        .filter((format) => (
          format?.has_audio &&
          (!format?.has_video) &&
          (typeof format?.url === 'string' || typeof format?.signature_cipher === 'string' || typeof format?.cipher === 'string')
        ))
        .sort((left, right) => (right?.bitrate || 0) - (left?.bitrate || 0));

      const fallbackAudioCandidates = allFormats
        .filter((format) => (
          format?.has_audio &&
          (typeof format?.url === 'string' || typeof format?.signature_cipher === 'string' || typeof format?.cipher === 'string')
        ))
        .sort((left, right) => (right?.bitrate || 0) - (left?.bitrate || 0));

      const selectedFormat = audioCandidates[0] || fallbackAudioCandidates[0];

      if (!selectedFormat?.itag) {
        throw new Error('No playable decipherable audio format found for this video.');
      }

      const audioStream = await info.download({
        itag: selectedFormat.itag
      });

      stream = Readable.fromWeb(audioStream);
    } catch (err) {
      throw new Error(`Failed to create audio stream: ${err?.info?.reason || err.message}`);
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
        console.error('Error reusing existing player, cleaning up and recreating:', err);
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
      console.error('Audio player error for guild', guildId, error);
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
