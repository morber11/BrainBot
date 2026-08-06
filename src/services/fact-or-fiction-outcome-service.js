const CONSTANTS = require('../utils/constants.js');

function resolveFactOrFictionOutcome({ existingValue, created, valueRoll, responseRoll }) {
    const value = created
        ? getValueFromRoll(valueRoll)
        : existingValue;
    const responses = CONSTANTS.FACT_OR_FICTION.RESPONSES.filter(response => response.category === value);
    const responseIndex = Math.floor(responseRoll * responses.length);

    return {
        value,
        response: responses[responseIndex].response,
        shouldPersistValue: created,
    };
}

function getValueFromRoll(valueRoll) {
    return valueRoll % 2 === 0
        ? CONSTANTS.FACT_OR_FICTION.VALUES.FACT
        : CONSTANTS.FACT_OR_FICTION.VALUES.FICTION;
}

module.exports = {
    resolveFactOrFictionOutcome,
};
