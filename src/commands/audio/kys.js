const { SlashCommandBuilder } = require('discord.js');
const { playAudioInVoiceChannel } = require('../../utils/voice-chat-util');
const logger = require('../../utils/logger.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('kys')
                .setDescription('young man'),
        async execute(interaction) {
                const url = 'https://www.youtube.com/watch?v=SQsmW0mMKZc'

                try {
                        await playAudioInVoiceChannel(interaction, url);

                        await interaction.reply("young man");
                } catch (error) {
                        logger.error('Error:', error);
                        await interaction.reply('An error occurred while trying to play the audio.');
                }
        },
};