const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('@distube/ytdl-core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const urlUtility = require('../../utils/custom-url-util.js');
const stringUtility = require('../../utils/string-util.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('meditate')
                .setDescription('Realign your chakras with 30khz binaural beats and 528hz frequency music'),
        async execute(interaction) {
                try {
                        // const urls = await urlUtility.getUrls('meditate');
                        const urls = [];

                        if (urls.length === 0) {
                                await interaction.reply('No URLs found.');
                                return;
                        }

                        const { url } = stringUtility.selectRandomFromArray(urls);
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

                        await interaction.reply("release yourself from worldly desires and become one with the universe.");
                } catch (error) {
                        console.error('Error:', error);
                        await interaction.reply('An error occurred while trying to play the audio.');
                }
        },
};
