"use strict";

// the real big brain functions
const brainScan = (message) => async function(message) {
    // if someone mentions brains, react with brain emote
    if (message.content.toLowerCase().includes("brain"))
        message.react('\uD83E\uDDE0');

    // if the message is the brain emote, react with regional indicators spelling out brain.
    if (message.content.toLowerCase().includes("\uD83E\uDDE0")) {
        message.react('\uD83C\uDDE7');
        message.react('\uD83C\uDDF7');
        message.react('\uD83C\uDDE6');
        message.react('\uD83C\uDDEE');
        message.react('\uD83C\uDDF3');
    }
}

module.exports = {
    brainScan: function() {}
};