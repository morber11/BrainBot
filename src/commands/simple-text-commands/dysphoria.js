const { SlashCommandBuilder } = require('discord.js');
const CustomUrl = require('../../dal/models/custom-url.js');
const stringUtility = require('../../utils/string-util.js');

async function getUrls() {
	try {
		const urls = await CustomUrl.findAll({
			attributes: ['url'],
			where: { type: 'dysphoria' },
			raw: true
		});
		return urls;
	} catch (error) {
		console.error(error);
		return [];
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dysphoria')
		.setDescription('Shows the truth.txt'),
	async execute(interaction) {
		try {
			await interaction.deferReply();

			const urls = await getUrls();

			if (urls.length === 0) {
				await interaction.editReply('No URLs found.');
				return;
			}

			const el = stringUtility.selectRandomFromArray(urls);

			await interaction.editReply(el.url);
		} catch (error) {
			console.error(error);
			await interaction.editReply('An error occurred.');
		}
	}
};