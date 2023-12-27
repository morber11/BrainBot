const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('brainbothelp')
		.setDescription('Shows the help menu'),
	async execute(interaction) {
		await interaction.reply("You don't need help");
	},
};