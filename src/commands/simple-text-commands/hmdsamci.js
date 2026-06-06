const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hmdsamci')
        .setDescription('how many days since a major cybersecurity incident'),
    async execute(interaction) {
        await interaction.reply(`how many days since a major cybersecurity incident\nhttps://howmanydayssinceamajorcybersecurityincident.morber11.workers.dev/`);
    }
};
