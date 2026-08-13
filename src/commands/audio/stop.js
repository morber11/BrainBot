const { SlashCommandBuilder } = require('discord.js');
const { stopAudioInVoiceChannel } = require('../../utils/voice-chat-util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('stop the current audio'),
    async execute(interaction) {
        const stopped = stopAudioInVoiceChannel(interaction.guildId);

        if (stopped) {
            await interaction.reply('Stopped playback');
            return;
        }

        await interaction.reply('Nothing is playing');
    },
};
