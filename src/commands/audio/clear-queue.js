const { SlashCommandBuilder } = require('discord.js');
const { clearAudioQueue } = require('../../utils/voice-chat-util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearqueue')
        .setDescription('clear the audio queue'),
    async execute(interaction) {
        const cleared = clearAudioQueue(interaction.guildId);

        if (cleared) {
            await interaction.reply('Cleared queue');
            return;
        }

        await interaction.reply('The queue is empty');
    },
};
