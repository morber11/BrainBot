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
    buildTable,
    addStatEntry,
    generateStatsTable,
};
