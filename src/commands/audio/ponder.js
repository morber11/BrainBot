const { SlashCommandBuilder } = require('discord.js');
const { playAudioInVoiceChannel } = require('../../utils/voice-chat-util');
const logger = require('../../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ponder')
        .setDescription('when you want to brain'),
    async execute(interaction) {
        const url = 'https://www.youtube.com/watch?v=AXqMnPyx73E';

        await interaction.deferReply();

        try {
            await playAudioInVoiceChannel(interaction, url);

            await interaction.editReply("brain brain brain brain");
        } catch (error) {
            logger.error('Error:', error);
            const content = error.userMessage ?? 'An error occurred while trying to play the audio.';
            await interaction.editReply(content);
        }
    },
};
