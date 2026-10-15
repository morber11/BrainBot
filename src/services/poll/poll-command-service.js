const Poll = require('../../dal/models/poll.js');

async function createPoll(attrs) {
    return Poll.create(attrs);
}

async function markEnded(id) {
    return Poll.update({ ended: true }, { where: { id } });
}

module.exports = { createPoll, markEnded };
