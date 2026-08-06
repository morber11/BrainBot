const cryptUtil = require('../../utils/crypt-util.js');

describe('crypt-util', () => {
    it('returns a sha256 hash for a known value', () => {
        const result = cryptUtil.getHash({ value: 'https://example.com' });

        expect(result).to.deep.equal({
            hash: '100680ad546ce6a577f42f52df33b4cfdca756859e664b8d7de329b150d09ce9',
        });
    });
});
