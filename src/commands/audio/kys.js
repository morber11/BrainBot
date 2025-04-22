const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('@distube/ytdl-core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('kys')
                .setDescription('young man'),
        async execute(interaction) {

                const url = 'https://www.youtube.com/watch?v=SQsmW0mMKZc'
                const stream = ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25, });
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
                await interaction.reply("young man");


        },
};