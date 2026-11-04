const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const birthdayService = require('../../services/birthday-service.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removebirthday')
        .setDescription('Remove your birthday')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const removedCount = await birthdayService.removeBirthday(interaction.guildId, interaction.user.id);

        if (removedCount === 0) {
            await interaction.reply({
                content: "You don't have a birthday saved in this server",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.reply('Birthday removed');
    },
};
