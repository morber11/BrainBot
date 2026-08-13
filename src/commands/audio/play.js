const { SlashCommandBuilder } = require('discord.js');
const { playAudioInVoiceChannel, isValidAudioUrl } = require('../../utils/voice-chat-util');
const { getYouTubeTitle } = require('../../services/youtube-audio-service.js');
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
    async execute(interaction) {
        const url = interaction.options.getString('url');

        if (!isValidAudioUrl(url)) {
            await interaction.reply({ content: 'Invalid or unsupported URL. Please provide a valid YouTube URL', ephemeral: true });
            return;
        }

        try {
            const playback = await playAudioInVoiceChannel(interaction, url);

            if (!playback.queued) {
                await interaction.reply({ content: `Now playing: ${url}` });
                return;
            }

            try {
                const title = await getYouTubeTitle(url);
                await interaction.reply({ content: `Added to queue: ${title}` });
            } catch (error) {
                logger.error('Error getting YouTube title:', error);
                await interaction.reply({ content: `Added to queue: ${url}` });
            }
        } catch (error) {
            logger.error('Error playing audio:', error);
            await interaction.reply({ content: 'An error occurred while trying to play the audio', ephemeral: true });
        }
    },
};
