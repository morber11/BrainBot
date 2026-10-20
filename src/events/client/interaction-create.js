const { MessageFlags } = require('discord.js');
const logger = require('../../utils/logger.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);

            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (err) {
                logger.error(err, { handler: 'interactionCreate', commandName });

                // if already replied, don't spam more replies
                // otherwise it'll loop forever in errs
                if (interaction.replied || interaction.deferred) return;

                await interaction.reply({
                    content: `Something went wrong while executing this command`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }
}