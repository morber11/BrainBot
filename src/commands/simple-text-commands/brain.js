const { SlashCommandBuilder } = require('discord.js');
const stringUtility = require('../../utils/string-util.js');
const userStatCommandService = require('../../services/user-stat-command-service.js');
const CONSTANTS = require('../../utils/constants.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('brain')
        .setDescription('brain brain brain brain brain')
        .addStringOption(option =>
            option.setName('brains')
                .setDescription('number of brains')
                .setMaxLength(3)
        ),
    async execute(interaction) {
        let numBrains = interaction.options.getString('brains');
        let message = '';

        if (stringUtility.isNumeric(numBrains)) {
            numBrains = Math.min(Math.max(parseInt(numBrains, 10) || 0, 0), CONSTANTS.BRAIN.MAX_BRAINS);

            for (let i = 0; i < numBrains; ++i) {
                message += 'brain ';
            }
        } else {
            message = 'brain brain brain brain';
        }

        message = message.trimEnd();

        await interaction.reply(message);

        const userId = interaction.user && interaction.user.id;
        await userStatCommandService.incrementUserStat(userId, CONSTANTS.STATS.BRAIN, CONSTANTS.STATS.BRAIN_FRIENDLY);
    }
};
