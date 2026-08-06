const { SlashCommandBuilder } = require('discord.js');
const reminderService = require('../../services/reminder-service.js');
const reminderHelper = require('../../services/reminder-helper.js');
const CONSTANTS = require('../../utils/constants.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme')
        .setDescription('Create a reminder for yourself or another user')
        .addStringOption(option => option
            .setName('message')
            .setDescription('The reminder message')
            .setRequired(true))
        .addUserOption(option => option
            .setName('target')
            .setDescription('User to remind')
            .setRequired(false))
        .addStringOption(option => option
            .setName('time')
            .setDescription('When to remind (3h, 30m, 60 minutes, or ISO date)')),
    async execute(interaction) {
        const timeInput = interaction.options.getString('time');
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const message = interaction.options.getString('message');

        const now = new Date();
        const alertOffsetMinutes = CONSTANTS.REMINDER.DEFAULT_ALERT_MINUTES;
        const schedule = reminderHelper.createReminderSchedule({ timeInput, now, alertOffsetMinutes });


        if (!schedule) {
            await interaction.reply({
                content: 'Please provide a valid future time. Format like so: "3h, 30m, 60 minutes, etc..." or use an ISO date string',
                ephemeral: true,
            });
            return;
        }

        const { remindAt, alertAt } = schedule;

        if (remindAt <= now) {
            await interaction.reply({
                content: 'Please provide a future time for the reminder. Try "3h, 30m, etc..." or leave blank to use default',
                ephemeral: true,
            });
            return;
        }

        await reminderService.createReminder({
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            creatorId: interaction.user.id,
            userId: targetUser.id,
            message,
            remindAt,
            alertAt,
            alertOffsetMinutes,
        });

        const reminderTarget = targetUser.id === interaction.user.id ? 'you' : `<@${targetUser.id}>`;
        await interaction.reply(`Reminder set for ${reminderTarget} at ${reminderHelper.formatReminderTime(remindAt)} in this channel`);
    },
};
