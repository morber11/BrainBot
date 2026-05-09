const { SlashCommandBuilder } = require('discord.js');
const customUrlService = require('../../services/custom-url-service.js');
const stringUtility = require('../../utils/string-util.js');
const logger = require('../../utils/logger.js');

async function getUrls() {
    try {
        const urls = await customUrlService.findAllByType('jimcarrey', ['value', 'url']);
        return urls;
    } catch (error) {
        logger.error(error);
        return [];
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jimcarrey')
        .setDescription('Gets a random Jim Carrey image'),
    async execute(interaction) {
        await interaction.deferReply();


        const urls = await getUrls();

        if (urls.length === 0) {
            await interaction.editReply('No URLs found.');
            return;
        }

        const { value, url } = stringUtility.selectRandomFromArray(urls);

        await interaction.editReply(`Jim Carrey ${value}:\n${url}`);
    }
};