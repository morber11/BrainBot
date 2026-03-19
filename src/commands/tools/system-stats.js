const { SlashCommandBuilder } = require('discord.js');
const Stat = require('../../dal/models/stat.js');
const statsUtil = require('../../utils/stats-util.js');
const CONSTANTS = require('../../utils/constants.js');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('system-stats')
        .setDescription('display collected system command usage statistics'),
    async execute(interaction) {
        const rows = await Stat.findAll({ order: [['sort_order', 'ASC'], ['count', 'DESC']] });

        if (!rows || rows.length === 0) {
            return interaction.reply('There are no statistics recorded yet.');
        }

        const entries = rows.map(r =>
            statsUtil.addStatEntry({ label: r.friendly_name || r.stat, value: r.count })
        );

        const askEntry = statsUtil.addStatEntry({ label: CONSTANTS.STATS.ASK_FRIENDLY, value: '0' });
        if (askEntry) entries.unshift(askEntry);

        const table = statsUtil.generateStatsTable(entries);
        await interaction.reply(`\`\`\`\n${table}\`\`\``);
    },
    buildTable: statsUtil.buildTable,
    generateStatsTable: statsUtil.generateStatsTable,
};
