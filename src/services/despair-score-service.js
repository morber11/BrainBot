function calculateDespairChange({ content, keywords, currentCount }) {
    const keywordValues = new Map(keywords.map((keyword) => [
        keyword.name,
        keyword.value !== null && keyword.value !== undefined ? keyword.value : 1,
    ]));

    let delta = 0;
    content.toLowerCase().split(' ').forEach((word) => {
        if (keywordValues.has(word)) {
            delta += keywordValues.get(word);
        }
    });

    return {
        delta,
        nextCount: calculateNextDespairCount({ currentCount, delta }).nextCount,
    };
}

function calculateNextDespairCount({ currentCount, delta }) {
    const changedCount = currentCount + delta;

    return {
        nextCount: changedCount > 0 ? changedCount : 0,
    };
}

module.exports = {
    calculateDespairChange,
    calculateNextDespairCount,
};
