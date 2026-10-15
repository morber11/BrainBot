const pollMessageService = require('../../services/poll/poll-message-service.js');

module.exports = {
    name: 'messageReactionRemove',
    execute(reaction, user) {
        // in case someone reacts and then removed their reaction, we want to update the poll
        pollMessageService.handlePollReaction(reaction, user);
    }
};
