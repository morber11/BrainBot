const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('therapy')
        .setDescription('pls rember'),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const response = [
                'pls rember that wen u feel scare or frigten',
                'never forget ttimes wen u feeled happy',
                '',
                'wen day is dark alway rember happy day',
                '',
                'https://youtu.be/x6LovY_DdEE?si=bv3gjBJyXuVc7U-u',
            ].join('\n');
            await interaction.editReply(response);
        } catch (error) {
            logger.error(error);
            await interaction.editReply('An error occurred.');
        }
    }
};
