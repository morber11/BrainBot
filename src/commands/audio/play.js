const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
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

                await interaction.reply(`Now playing: ${url}`);
        },
};