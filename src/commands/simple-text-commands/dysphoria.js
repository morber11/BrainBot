const { SlashCommandBuilder } = require('discord.js');
const customUrlService = require('../../services/custom-url-service.js');
const stringUtility = require('../../utils/string-util.js');
const logger = require('../../utils/logger.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dysphoria')
		.setDescription('Shows the truth.txt'),
	async execute(interaction) {
		try {
			await interaction.deferReply();

			const urls = await customUrlService.findAllByType('dysphoria', ['url']).catch(() => []);

			if (urls.length === 0) {
				await interaction.editReply('No URLs found.');
				return;
			}

			const el = stringUtility.selectRandomFromArray(urls);

			await interaction.editReply(el.url);
		} catch (error) {
			logger.error(error);
			await interaction.editReply('An error occurred.');
		}
	}
};