const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const birthdayService = require('../../services/birthday-service.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Register your birthday')
        .addIntegerOption(option => option
            .setName('day')
            .setDescription('Day of the month')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(31))
        .addIntegerOption(option => option
            .setName('month')
            .setDescription('Month')
            .setRequired(true)
            .addChoices(
                { name: 'January', value: 1 },
                { name: 'February', value: 2 },
                { name: 'March', value: 3 },
                { name: 'April', value: 4 },
                { name: 'May', value: 5 },
                { name: 'June', value: 6 },
                { name: 'July', value: 7 },
                { name: 'August', value: 8 },
                { name: 'September', value: 9 },
                { name: 'October', value: 10 },
                { name: 'November', value: 11 },
                { name: 'December', value: 12 },
            ))
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const day = interaction.options.getInteger('day');
        const month = interaction.options.getInteger('month');

        // 2000 is a leap year so 29 february is allowed
        const daysInMonth = new Date(2000, month, 0).getDate();

        if (day > daysInMonth) {
            await interaction.reply({
                content: "That date doesn't exist, please pick a valid day for that month",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await birthdayService.setBirthday({
            guildId: interaction.guildId,
            userId: interaction.user.id,
            month,
            day,
        });

        const formattedDate = new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'long' })
            .format(new Date(2000, month - 1, day));

        await interaction.reply(`Birthday saved for ${formattedDate}`);
    },
};
