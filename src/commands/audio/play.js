const { SlashCommandBuilder } = require('discord.js');
const { playAudioInVoiceChannel, isValidAudioUrl } = require('../../utils/voice-chat-util');
const logger = require('../../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('for when the other bots are broken')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('url')
                .setRequired(true),
        ),
    deprecated: true,
    async execute(interaction) {
        const url = interaction.options.getString('url');

        if (!isValidAudioUrl(url)) {
            await interaction.reply({ content: 'Invalid or unsupported URL. Please provide a valid YouTube URL.', ephemeral: true });
            return;
        }

        try {
            await playAudioInVoiceChannel(interaction, url);

            await interaction.reply({ content: `Now playing: ${url}` });
        } catch (error) {
            logger.error('Error playing audio:', error);
            await interaction.reply({ content: 'An error occurred while trying to play the audio.', ephemeral: true });
        }
    },
};
