const { SlashCommandBuilder } = require('discord.js');
const customUrlService = require('../../services/custom-url-service.js');
const stringUtility = require('../../utils/string-util.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jimcarrey')
        .setDescription('Gets a random Jim Carrey image'),
    async execute(interaction) {
        await interaction.deferReply();

        // consider moving urls out of the db and instead directly having the images like
        // we have with gadget/raven/jigsaw
        // this will also mean we don't need to deal with dead links
        const urls = await customUrlService.findAllByType('jimcarrey', ['value', 'url']).catch(() => []);

        if (urls.length === 0) {
            await interaction.editReply('No URLs found.');
            return;
        }

        const { value, url } = stringUtility.selectRandomFromArray(urls);

        await interaction.editReply(`Jim Carrey ${value}:\n${url}`);
    }
};
