const handleAsking = require('./handlers/handleAsking');
const handleBasicReactResponse = require('./handlers/handleBasicReactResponse');
const handlePatriotSalute = require('./handlers/handlePatriotSalute');
const handleMilk = require('./handlers/handleMilk');
const handleJigsaw = require('./handlers/handleJigsaw');
const handleRaven = require('./handlers/handleRaven');
const handleMentalDespair = require('./handlers/handleMentalDespair');
const handleInSpace = require('./handlers/handleInSpace');
const handleMarioJudah = require('./handlers/handleMarioJudah');
const handleBane = require('./handlers/handleBane');
const handleReplies = require('./handlers/handleReplies');
const botMessageWindowUtil = require('../../utils/bot-message-window-util.js');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) {
            if (message.author.id === message.client.user.id) {
                botMessageWindowUtil.open(message.channelId);
            }
            return;
        }

        const handlers = [
            handlePatriotSalute,
            handleBasicReactResponse,
            handleMilk,
            handleJigsaw,
            handleRaven,
            handleMentalDespair,
            handleAsking,
            handleInSpace,
            handleMarioJudah,
            handleBane,
            handleReplies,
        ];

        for (const handler of handlers) {
            await handler(message);
        }
    }
}
