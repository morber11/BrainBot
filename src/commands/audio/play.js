const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('@distube/ytdl-core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('play')
                .setDescription('for when the other bots are broken')
                .addStringOption(option =>
                        option.setName('url')
                                .setDescription('url')
                                .setRequired(true),
                ),
        async execute(interaction) {
                const url = interaction.options.getString('url');

                try {
                        const stream = ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 });
                        const resource = createAudioResource(stream);
                        const guildMember = await interaction.member.guild.members.fetch(interaction.user.id);
                        const { channelId } = guildMember.voice;

                        if (!channelId) {
                                return interaction.reply('You must join a voice channel first!');
                        }

                        const connection = joinVoiceChannel({
                                channelId: channelId,
                                guildId: interaction.guildId,
                                adapterCreator: interaction.channel.guild.voiceAdapterCreator,
                        });

                        const player = createAudioPlayer();
                        player.play(resource);
                        connection.subscribe(player);

                        await interaction.reply(`Now playing: ${url}`);
                } catch (error) {
                        console.error('Error:', error);
                        await interaction.reply('An error occurred while trying to play the audio.');
                }
        },
};
