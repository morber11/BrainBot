const { SlashCommandBuilder } = require('discord.js');
const { playAudioInVoiceChannel } = require('../../utils/voice-chat-util');
const logger = require('../../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kys')
        .setDescription('young man'),
    async execute(interaction) {
        const url = 'https://www.youtube.com/watch?v=SQsmW0mMKZc'

        await interaction.deferReply();

        try {
            await playAudioInVoiceChannel(interaction, url);

            await interaction.editReply("young man");
        } catch (error) {
            logger.error('Error:', error);
            const content = error.userMessage ?? 'An error occurred while trying to play the audio.';
            await interaction.editReply(content);
        }
    },
};