const { SlashCommandBuilder } = require('discord.js');
const { playAudioInVoiceChannel } = require('../../utils/voice-chat-util');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('waterphone')
                .setDescription('WAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
        async execute(interaction) {
                const url = 'https://www.youtube.com/watch?v=WJIP2C9v654';

                try {
                        await playAudioInVoiceChannel(interaction, url);

                        await interaction.reply("WAAAAAAAAAAAAAAAAAAAAAAAAAAA");
                } catch (error) {
                        console.error('Error:', error);
                        await interaction.reply('An error occurred while trying to play the audio.');
                }
        },
};
