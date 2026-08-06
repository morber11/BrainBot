const askResponseService = require('../../services/ask-response-service.js');

describe('ask-response-service', () => {
    it('returns null when content already contains "i didn\'t ask"', () => {
        const result = askResponseService.evaluateAskResponse({
            content: "i didn't ask for this",
            roll: 0,
        });

        expect(result).to.deep.equal({ replyText: null });
    });

    it('returns null for question forms', () => {
        [
            'what are your thoughts',
            'do you want to play',
            'anyone around?',
            '@Bob do you agree',
            '<@123456789> is this ok',
            '@Weightlifter nate what are your thoughts',
        ].forEach((content) => {
            const result = askResponseService.evaluateAskResponse({ content, roll: 0 });

            expect(result.replyText, content).to.equal(null);
        });
    });

    it('returns the normal response for statements', () => {
        const result = askResponseService.evaluateAskResponse({
            content: 'the sky is blue',
            roll: 99,
        });

        expect(result).to.deep.equal({ replyText: "i didn't ask" });
    });

    it('uses the long-message response at the roll boundary', () => {
        const result = askResponseService.evaluateAskResponse({
            content: 'this statement is deliberately long enough to cross the configured threshold for ask replies',
            roll: 90,
        });

        expect(result).to.deep.equal({ replyText: "that's a lot of words to not ask" });
    });

    it('uses the leading-I response at the roll boundary', () => {
        const result = askResponseService.evaluateAskResponse({
            content: 'I really want tacos',
            roll: 90,
        });

        expect(result).to.deep.equal({ replyText: "i didn't ask want tacos" });
    });
});
