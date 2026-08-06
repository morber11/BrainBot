const despairScoreService = require('../../services/despair-score-service.js');

describe('despair-score-service', () => {
    it('totals keyword values including repeated tokens', () => {
        const result = despairScoreService.calculateDespairChange({
            content: 'sad ok sad',
            keywords: [{ name: 'sad', value: 2 }],
            currentCount: 1,
        });

        expect(result).to.deep.equal({ delta: 4, nextCount: 5 });
    });

    it('treats null keyword values as one', () => {
        const result = despairScoreService.calculateDespairChange({
            content: 'sad',
            keywords: [{ name: 'sad', value: null }],
            currentCount: 0,
        });

        expect(result).to.deep.equal({ delta: 1, nextCount: 1 });
    });

    it('handles negative totals and clamps below zero', () => {
        const result = despairScoreService.calculateDespairChange({
            content: 'happy happy',
            keywords: [{ name: 'happy', value: -3 }],
            currentCount: 2,
        });

        expect(result).to.deep.equal({ delta: -6, nextCount: 0 });
    });

    it('calculates the next count from an already matched change', () => {
        const result = despairScoreService.calculateNextDespairCount({
            currentCount: 3,
            delta: -5,
        });

        expect(result).to.deep.equal({ nextCount: 0 });
    });
});
