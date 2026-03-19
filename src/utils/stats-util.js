const Stat = require('../dal/models/stat.js');
const UserStat = require('../dal/models/user-stat.js');
const logger = require('./logger.js');

async function incrementSystemStat(statKey, friendlyName = null, sortOrder = 100) {
    try {
        const [statRow] = await Stat.findOrCreate({
            where: { stat: statKey },
            defaults: { count: 0, friendly_name: friendlyName || statKey, sort_order: sortOrder },
        });
        await statRow.increment('count');

        return statRow;
    } catch (err) {
        logger.error(`Failed to increment system stat ${statKey}:`, err);
        return null;
    }
}

async function incrementUserStat(userId, statKey, friendlyName = null) {
    try {
        const [row, created] = await UserStat.findOrCreate({
            where: { userId: userId, stat: statKey },
            defaults: { count: 0, user_friendly_name: friendlyName || '' },
        });

        if (!created && friendlyName && row.user_friendly_name !== friendlyName) {
            await UserStat.update({ user_friendly_name: friendlyName }, { where: { id: row.id } });
            row.user_friendly_name = friendlyName;
        }

        await row.increment('count');

        return row;
    } catch (err) {
        logger.error(`Failed to increment user stat ${statKey} for user ${userId}:`, err);
        return null;
    }
}

function buildTable(entries) {
    const header = { label: 'Command', value: 'Times run' };
    const maxLabel = Math.max(header.label.length, ...entries.map(e => e.label.length));
    const maxValue = Math.max(header.value.length, ...entries.map(e => e.value.length));
    const pad = (str, len) => str + ' '.repeat(len - str.length);

    let t = '';
    t += `${pad(header.label, maxLabel)} | ${pad(header.value, maxValue)}\n`;
    t += `${'-'.repeat(maxLabel)}-|-${'-'.repeat(maxValue)}\n`;
    entries.forEach(e => {
        t += `${pad(e.label, maxLabel)} | ${pad(e.value, maxValue)}\n`;
    });
    return t;
}

function addStatEntry(item) {
    if (item == null) return null;

    if ('stat' in item && 'count' in item) {
        return { label: item.stat, value: String(item.count) };
    }
    if ('label' in item && 'value' in item) {
        return { label: item.label, value: String(item.value) };
    }

    throw new Error('Invalid stat entry');
}

function generateStatsTable(entries) {
    return buildTable(entries.filter(Boolean));
}

module.exports = {
    incrementSystemStat,
    incrementUserStat,
    incrementStat: incrementSystemStat,
    buildTable,
    addStatEntry,
    generateStatsTable,
};
