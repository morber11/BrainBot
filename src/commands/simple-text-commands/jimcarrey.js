const { SlashCommandBuilder } = require('discord.js');
const CustomUrl = require('../../dal/models/custom-url.js');
const stringUtility = require('../../utils/string-util.js');

async function getUrls() {
    try {
        const urls = await CustomUrl.findAll({
            attributes: ['value', 'url'],
            where: { type: 'jimcarrey' },
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