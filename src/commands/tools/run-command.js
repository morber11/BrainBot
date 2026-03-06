const { SlashCommandBuilder } = require('discord.js');
const patriotAct = require('../../functions/handlers/cron/patriot-act-cron');
const CONSTANTS = require('../../utils/constants.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('runcommand')
        .setDescription('debug command to manually run a command')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action to perform')
                .setRequired(true)
        ),
    devOnly: true,
    async execute(interaction, client) {
        const action = interaction.options.getString('action');
        if (action === CONSTANTS.COMMANDS.PATRIOT_ACT) {
            const job = patriotAct(client);
            job.fireOnTick();
            await interaction.reply('activating patriot');
            return;
        }

        await interaction.reply('invalid command');
    },
};
