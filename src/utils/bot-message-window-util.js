const WINDOW_MS = 60000;

const windowExpiries = new Map();

function open(channelId) {
    windowExpiries.set(channelId, Date.now() + WINDOW_MS);
}

function isOpen(channelId) {
    const expiresAt = windowExpiries.get(channelId);
    return expiresAt !== undefined && Date.now() < expiresAt;
}

function resetForTests() {
    windowExpiries.clear();
}

module.exports = {
    open,
    isOpen,
    resetForTests,
};
