const sinon = require('sinon');
const responseWindowUtil = require('../../utils/response-window-util.js');

describe('response window util', () => {
    afterEach(() => {
        responseWindowUtil.resetForTests();
        sinon.restore();
    });

    it('counts first salute and ignores repeats for same user in same guild', () => {
        responseWindowUtil.start('salute', 'g1', 60000);

        expect(responseWindowUtil.isActive('salute', 'g1')).to.be.true;
        expect(responseWindowUtil.shouldCount('salute', 'g1', 'u1')).to.be.true;
        expect(responseWindowUtil.shouldCount('salute', 'g1', 'u1')).to.be.false;
    });

    it('counts different users separately in same guild', () => {
        responseWindowUtil.start('salute', 'g1', 60000);

        expect(responseWindowUtil.shouldCount('salute', 'g1', 'u1')).to.be.true;
        expect(responseWindowUtil.shouldCount('salute', 'g1', 'u2')).to.be.true;
    });

    it('does not count after window expires until a new window opens', async () => {
        const clock = sinon.useFakeTimers();
        responseWindowUtil.start('salute', 'g1', 100);
        expect(responseWindowUtil.shouldCount('salute', 'g1', 'u1')).to.be.true;
        expect(responseWindowUtil.shouldCount('salute', 'g1', 'u1')).to.be.false;

        await clock.tickAsync(100);

        responseWindowUtil.start('salute', 'g1', 100);
        expect(responseWindowUtil.shouldCount('salute', 'g1', 'u1')).to.be.true;
    });

    it('keeps windows of different types separate when they share an id', () => {
        responseWindowUtil.start('salute', 'g1', 60000);
        expect(responseWindowUtil.shouldCount('salute', 'g1', 'u1')).to.be.true;

        responseWindowUtil.start('reply', 'g1', 60000);

        expect(responseWindowUtil.shouldCount('salute', 'g1', 'u1')).to.be.false;
        expect(responseWindowUtil.isActive('reply', 'g1')).to.be.true;
    });
});
