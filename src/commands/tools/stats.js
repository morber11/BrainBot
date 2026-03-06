const { SlashCommandBuilder } = require('discord.js');
const Stat = require('../../dal/models/stat.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('display collected command usage statistics'),
    async execute(interaction) {
        const rows = await Stat.findAll();

        if (!rows || rows.length === 0) {
            return interaction.reply('There are no statistics recorded yet.');
        }

        const LABELS = {
            patriot_act: 'number of salutes o7',
        };

        // build rows with padded columns for better display
        const data = rows.map(r => {
            return {
                label: LABELS[r.stat] || r.stat,
                count: String(r.count),
            };
        });
        const header = { label: 'Command', count: 'Times run' };

        const maxLabel = Math.max(
            header.label.length,
            ...data.map(d => d.label.length)
        );
        const maxCount = Math.max(
            header.count.length,
            ...data.map(d => d.count.length)
        );

        const pad = (str, len) => str + ' '.repeat(len - str.length);

        let table = '';
        table += `${pad(header.label, maxLabel)} | ${pad(header.count, maxCount)}\n`;
        table += `${'-'.repeat(maxLabel)}-|-${'-'.repeat(maxCount)}\n`;
        data.forEach(d => {
            table += `${pad(d.label, maxLabel)} | ${pad(d.count, maxCount)}\n`;
        });

        await interaction.reply(`\`\`\`\n${table}\`\`\``);
    },
};
