const { SlashCommandBuilder } = require('discord.js');
const stringUtility = require('../../utils/string-util.js');
const CONSTANTS = require('../../utils/constants.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('9ball')
		.setDescription('consult the magic 9 ball')
		.addStringOption(option =>
			option.setName('question')
				.setDescription('the question to ask')
				.setRequired(true),
		),
	async execute(interaction) {
		try {
			await interaction.deferReply();

			var question = interaction.options.getString('question');
			const el = stringUtility.selectRandomFromArray(CONSTANTS.MAGIC_BALL.RESPONSES);

			var response = `You have pondered the Magic 9-Ball for guidance\nYour answer is: ${el.response}.\nYour question was: "${question}"`
			await interaction.editReply(response);
		} catch (error) {
			console.error(error);
			await interaction.editReply('An error occurred.');
		}
	}
};