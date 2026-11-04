const { SlashCommandBuilder } = require('discord.js');
const patriotAct = require('../../functions/handlers/cron/patriot-act-cron');
const birthdayCron = require('../../functions/handlers/cron/birthday-cron');
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
        )
        .addStringOption(option =>
            option.setName('params')
                .setDescription('Extra input for the action, e.g. a user id')
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

        if (action === CONSTANTS.COMMANDS.BIRTHDAY) {
            const userId = interaction.options.getString('params');

            if (userId) {
                await birthdayCron.celebrate(client, { guildId: interaction.guildId, userId });
                await interaction.reply(`ran birthday check for ${userId}`);
                return;
            }

            const job = birthdayCron(client);
            job.fireOnTick();
            await interaction.reply('checking birthdays');
            return;
        }

        if (action === CONSTANTS.COMMANDS.DIDNT_ASK) {
            await ask.forceSend(interaction);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply('force sent');
            }
            return;
        }

        await interaction.reply('invalid command');
    },
};
