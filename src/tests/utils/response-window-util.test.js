const sinon = require('sinon');
const responseWindowUtil = require('../../utils/response-window-util.js');

describe('response window util', () => {
    afterEach(() => {
        responseWindowUtil.resetForTests();
        sinon.restore();
    });

    it('counts first salute and ignores repeats for same user in same guild', () => {
        responseWindowUtil.start('g1', 60000);

        expect(responseWindowUtil.isActive('g1')).to.be.true;
        expect(responseWindowUtil.shouldCount('g1', 'u1')).to.be.true;
        expect(responseWindowUtil.shouldCount('g1', 'u1')).to.be.false;
    });

    it('counts different users separately in same guild', () => {
        responseWindowUtil.start('g1', 60000);

        expect(responseWindowUtil.shouldCount('g1', 'u1')).to.be.true;
        expect(responseWindowUtil.shouldCount('g1', 'u2')).to.be.true;
    });

    it('does not count after window expires until a new window opens', async () => {
        const clock = sinon.useFakeTimers();
        responseWindowUtil.start('g1', 100);
        expect(responseWindowUtil.shouldCount('g1', 'u1')).to.be.true;
        expect(responseWindowUtil.shouldCount('g1', 'u1')).to.be.false;

        await clock.tickAsync(100);

        responseWindowUtil.start('g1', 100);
        expect(responseWindowUtil.shouldCount('g1', 'u1')).to.be.true;
    });
});
