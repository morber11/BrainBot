const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('ponder')
                .setDescription('when you want to brain'),
        async execute(interaction) {
                const url = 'https://www.youtube.com/watch?v=AXqMnPyx73E'
                const stream = ytdl(url, { filter: 'audioonly' });
                const player = createAudioPlayer();
                const resource = createAudioResource(stream);
                const guildMember = await interaction.member.guild.members.fetch(interaction.user.id);
                const { channelId } = guildMember.voice;
                const connection = joinVoiceChannel({
                        channelId: channelId,
                        guildId: interaction.guildId,
                        adapterCreator: interaction.channel.guild.voiceAdapterCreator,
                });
                connection.subscribe(player);
                player.play(resource);
                await interaction.reply("brain brain brain brain");
        },
};