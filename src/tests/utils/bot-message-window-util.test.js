const sinon = require('sinon');
const botMessageWindowUtil = require('../../utils/bot-message-window-util.js');

describe('bot message window util', () => {
    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        botMessageWindowUtil.resetForTests();
    });

    it('is open only in the channel the bot posted in', () => {
        botMessageWindowUtil.open('c1');

        expect(botMessageWindowUtil.isOpen('c1')).to.be.true;
        expect(botMessageWindowUtil.isOpen('c2')).to.be.false;
    });

    it('closes after one minute until the bot posts again', () => {
        botMessageWindowUtil.open('c1');

        clock.tick(60000);
        expect(botMessageWindowUtil.isOpen('c1')).to.be.false;

        botMessageWindowUtil.open('c1');
        expect(botMessageWindowUtil.isOpen('c1')).to.be.true;
    });
});
