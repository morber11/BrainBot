const responses = new Map();

function start(guildId, durationMs = 60000) {
    if (!guildId) {
        return;
    }

    if (responses.has(guildId)) {
        const existing = responses.get(guildId);
        clearTimeout(existing.timer);
    }

    const seenUsers = new Set();
    const timer = setTimeout(() => {
        responses.delete(guildId);
    }, durationMs);

    responses.set(guildId, { timer, seenUsers });
}

function isActive(guildId) {
    return responses.has(guildId);
}

function shouldCount(guildId, userId) {
    const response = responses.get(guildId);
    if (!response) {
        return false;
    }

    if (response.seenUsers.has(userId)) {
        return false;
    }

    response.seenUsers.add(userId);
    return true;
}

function resetForTests() {
    responses.forEach(value => clearTimeout(value.timer));
    responses.clear();
}

module.exports = {
    start,
    isActive,
    shouldCount,
    resetForTests,
};
