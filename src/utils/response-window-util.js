const responses = new Map();

function getKey(type, id) {
    return `${type}:${id}`;
}

function start(type, id, durationMs = 60000) {
    if (!id) {
        return;
    }

    const key = getKey(type, id);

    if (responses.has(key)) {
        const existing = responses.get(key);
        clearTimeout(existing.timer);
    }

    const seenUsers = new Set();
    const timer = setTimeout(() => {
        responses.delete(key);
    }, durationMs);

    responses.set(key, { timer, seenUsers });
}

function isActive(type, id) {
    return responses.has(getKey(type, id));
}

function shouldCount(type, id, userId) {
    const response = responses.get(getKey(type, id));
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
