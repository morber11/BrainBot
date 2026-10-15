const Sequelize = require('sequelize');
const Poll = require('../../dal/models/poll.js');

async function findActivePollByMessageId(messageId) {
    return Poll.findOne({
        where: { messageId, ended: false },
    });
}

async function findPollsEndingBy(cutoff) {
    return Poll.findAll({
        where: {
            ended: false,
            endsAt: { [Sequelize.Op.lte]: cutoff },
        },
    });
}

module.exports = { findActivePollByMessageId, findPollsEndingBy };
