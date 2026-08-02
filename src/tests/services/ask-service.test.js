const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('ask-service', () => {
    let askService;

    beforeEach(() => {
        askService = proxyquire('../../services/ask-service.js', {
            './system-stat-service.js': { incrementSystemStat: sinon.stub() },
            '../utils/logger.js': { error: sinon.stub() },
        });
    });

    describe('getAskText', () => {
        it('returns null when the message already contains "i didn\'t ask"', () => {
            expect(askService.getAskText({ content: "i didn't ask for this" })).to.equal(null);
        });

        it('returns null for the reported bug message (@mention + name + question phrase)', () => {
            expect(askService.getAskText({ content: '@Weightlifter nate what are your thoughts' })).to.equal(null);
        });

        it('returns null for questions', () => {
            // one case per detection path: leading question word, leading aux
            // verb, trailing "?", and @-mention / <@id> mention prefixes
            [
                'what are your thoughts',
                'do you want to play',
                'anyone around?',
                '@Bob do you agree',
                '<@123456789> is this ok',
            ].forEach((content) => {
                expect(askService.getAskText({ content }), content).to.equal(null);
            });
        });

        it('returns "i didn\'t ask" for statements', () => {
            sinon.stub(Math, 'random').returns(0);
            ['the sky is blue', 'i am hungry', 'i know what you did'].forEach((content) => {
                expect(askService.getAskText({ content }), content).to.equal("i didn't ask");
            });
        });
    });
});
