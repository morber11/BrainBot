const { SlashCommandBuilder } = require('discord.js');
const { playAudioInVoiceChannel } = require('../../utils/voice-chat-util');
const urlUtility = require('../../utils/custom-url-util.js');
const stringUtility = require('../../utils/string-util.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('meditate')
                .setDescription('Realign your chakras with 30khz binaural beats and 528hz frequency music'),
        async execute(interaction) {
                try {
                        const urls = await urlUtility.getUrls('meditate');

                        if (urls.length === 0) {
                                await interaction.reply('No URLs found.');
                                return;
                        }

                        const { url } = stringUtility.selectRandomFromArray(urls);
                        await playAudioInVoiceChannel(interaction, url);

                        await interaction.reply("release yourself from worldly desires and become one with the universe.");
                } catch (error) {
                        console.error('Error:', error);
                        await interaction.reply('An error occurred while trying to play the audio.');
                }
        },
};
