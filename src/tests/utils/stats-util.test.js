const statsUtil = require('../../utils/stats-util.js');

describe('stats-util', () => {
    it('addStatEntry converts the value to a string', () => {
        const entry = statsUtil.addStatEntry({ label: 'beta', value: 7 });

        expect(entry).to.deep.equal({ label: 'beta', value: '7' });
    });

    it('generateStatsTable produces a table string', () => {
        const entries = [
            statsUtil.addStatEntry({ label: 'one', value: 1 }),
            statsUtil.addStatEntry({ label: 'two', value: 22 }),
        ];

        const table = statsUtil.generateStatsTable(entries);

        expect(table).to.be.a('string');
        expect(table).to.include('Command');
        expect(table).to.include('Times run');
        expect(table).to.include('one');
        expect(table).to.include('22');
    });
});
