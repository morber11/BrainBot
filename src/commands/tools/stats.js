const { SlashCommandBuilder } = require('discord.js');
const UserStat = require('../../dal/models/user-stat.js');
const statsUtil = require('../../utils/stats-util.js');
const CONSTANTS = require('../../utils/constants.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('what have you or have you not done'),
    async execute(interaction) {
        const userId = interaction.user && interaction.user.id;
        if (!userId) return interaction.reply('Unable to determine user.');

        await statsUtil.incrementUserStat(userId, CONSTANTS.STATS.USER_STATS, CONSTANTS.STATS.USER_STATS_FRIENDLY);

        const rows = await UserStat.findAll({ where: { userId }, order: [['count', 'DESC']] });

        if (!rows || rows.length === 0) {
            return interaction.reply('You have no recorded statistics yet.');
        }

        const entries = rows.map(r =>
            statsUtil.addStatEntry({ label: r.user_friendly_name || r.stat, value: r.count })
        );

        const table = statsUtil.generateStatsTable(entries);
        await interaction.reply(`\`\`\`\n${table}\`\`\``);
    },
    buildTable: statsUtil.buildTable,
    generateStatsTable: statsUtil.generateStatsTable,
};