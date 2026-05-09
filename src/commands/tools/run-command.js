const { SlashCommandBuilder } = require('discord.js');
const patriotAct = require('../../functions/handlers/cron/patriot-act-cron');
const CONSTANTS = require('../../utils/constants.js');
const ask = require('../../services/ask-service.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('runcommand')
        .setDescription('debug command to manually run a command')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action to perform')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('delay')
                .setDescription('Delay in milliseconds before running the action (0 for no delay) - used for CRONs')
                .setRequired(false)
        ),
    devOnly: true,
    async execute(interaction, client) {
        const action = interaction.options.getString('action');

        if (action === CONSTANTS.COMMANDS.PATRIOT_ACT) {
            const delay = interaction.options.getInteger('delay');
            const job = patriotAct(client, undefined, delay);
            job.fireOnTick();
            await interaction.reply('activating patriot');
            return;
        }

        if (action === CONSTANTS.COMMANDS.DIDNT_ASK) {
            const sent = await ask.forceSend(interaction);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply('force sent');
            }
            return;
        }

        await interaction.reply('invalid command');
    },
};
