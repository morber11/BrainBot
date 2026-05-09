const statsUtil = require('../../utils/stats-util.js');

describe('stats-util', () => {
    it('addStatEntry handles stat/count and label/value shapes', () => {
        const a = statsUtil.addStatEntry({ stat: 'alpha', count: 3 });
        const b = statsUtil.addStatEntry({ label: 'beta', value: 7 });

        expect(a).to.deep.equal({ label: 'alpha', value: '3' });
        expect(b).to.deep.equal({ label: 'beta', value: '7' });
    });

    it('addStatEntry returns null for null input', () => {
        const res = statsUtil.addStatEntry(null);
        expect(res).to.equal(null);
    });

    it('generateStatsTable produces a table string', () => {
        const entries = [
            statsUtil.addStatEntry({ stat: 'one', count: 1 }),
            statsUtil.addStatEntry({ stat: 'two', count: 22 }),
        ];

        const table = statsUtil.generateStatsTable(entries);

        expect(table).to.be.a('string');
        expect(table).to.include('Command');
        expect(table).to.include('Times run');
        expect(table).to.include('one');
        expect(table).to.include('22');
    });
});
