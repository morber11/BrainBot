const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');

async function playAudioInVoiceChannel(interaction, url) {
  try {
    
    const stream = ytdl(url, { 
        filter: 'audioonly', 
        highWaterMark: 1 << 25 // buffer
    });
    const resource = createAudioResource(stream);

    const guildMember = await interaction.member.guild.members.fetch(interaction.user.id);
    const { channelId } = guildMember.voice;

    if (!channelId) {
      throw new Error('You must join a voice channel first!');
    }

    const connection = joinVoiceChannel({
      channelId: channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

    return { player, connection };
  } catch (error) {
    throw new Error(`Failed to join or play in voice channel: ${error.message}`);
  }
}

module.exports = { playAudioInVoiceChannel };
