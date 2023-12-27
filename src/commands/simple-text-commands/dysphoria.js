const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dysphoria')
		.setDescription('Shows the truth.txt'),
	async execute(interaction) {
		await interaction.reply("https://www.javascript.com/");
	},
};