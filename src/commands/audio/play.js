const { SlashCommandBuilder } = require('discord.js');
const { playAudioInVoiceChannel } = require('../../utils/voice-chat-util');

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
                        await playAudioInVoiceChannel(interaction, url);

                        await interaction.reply(`Now playing: ${url}`);
                } catch (error) {
                        console.error('Error:', error);
                        await interaction.reply('An error occurred while trying to play the audio.');
                }
        },
};
