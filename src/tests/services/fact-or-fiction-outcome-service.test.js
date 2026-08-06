const CONSTANTS = require('../../utils/constants.js');
const factOrFictionOutcomeService = require('../../services/fact-or-fiction-outcome-service.js');

describe('fact-or-fiction-outcome-service', () => {
    it('keeps an existing value and chooses a matching response', () => {
        const result = factOrFictionOutcomeService.resolveFactOrFictionOutcome({
            existingValue: CONSTANTS.FACT_OR_FICTION.VALUES.FACT,
            created: false,
            valueRoll: 1,
            responseRoll: 0,
        });

        expect(result.value).to.equal(CONSTANTS.FACT_OR_FICTION.VALUES.FACT);
        expect(result.response).to.equal(CONSTANTS.FACT_OR_FICTION.RESPONSES
            .filter(response => response.category === CONSTANTS.FACT_OR_FICTION.VALUES.FACT)[0].response);
        expect(result.shouldPersistValue).to.equal(false);
    });

    it('uses even rolls for fact on new entries', () => {
        const result = factOrFictionOutcomeService.resolveFactOrFictionOutcome({
            existingValue: null,
            created: true,
            valueRoll: 2,
            responseRoll: 0,
        });

        expect(result.value).to.equal(CONSTANTS.FACT_OR_FICTION.VALUES.FACT);
        expect(result.shouldPersistValue).to.equal(true);
    });

    it('uses odd rolls for fiction on new entries', () => {
        const result = factOrFictionOutcomeService.resolveFactOrFictionOutcome({
            existingValue: null,
            created: true,
            valueRoll: 1,
            responseRoll: 0.999,
        });
        const fictionResponses = CONSTANTS.FACT_OR_FICTION.RESPONSES
            .filter(response => response.category === CONSTANTS.FACT_OR_FICTION.VALUES.FICTION);

        expect(result.value).to.equal(CONSTANTS.FACT_OR_FICTION.VALUES.FICTION);
        expect(result.response).to.equal(fictionResponses[fictionResponses.length - 1].response);
        expect(result.shouldPersistValue).to.equal(true);
    });
});
