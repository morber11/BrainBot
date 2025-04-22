const { SlashCommandBuilder } = require('discord.js');
const { playAudioInVoiceChannel } = require('../../utils/voice-chat-util');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('ponder')
                .setDescription('when you want to brain'),
        async execute(interaction) {
                const url = 'https://www.youtube.com/watch?v=AXqMnPyx73E';

                try {
                        await playAudioInVoiceChannel(interaction, url);

                        await interaction.reply("brain brain brain brain");
                } catch (error) {
                        console.error('Error:', error);
                        await interaction.reply('An error occurred while trying to play the audio.');
                }
        },
};
