const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('what do you think it does ?!'), 
    devOnly: true,
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};