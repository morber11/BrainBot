const handleAsking = require('./handlers/handleAsking');
const handleBasicReactResponse = require('./handlers/handleBasicReactResponse');
const handlePatriotSalute = require('./handlers/handlePatriotSalute');
const handleMilk = require('./handlers/handleMilk');
const handleJigsaw = require('./handlers/handleJigsaw');
const handleRaven = require('./handlers/handleRaven');
const handleMentalDespair = require('./handlers/handleMentalDespair');
const handleInSpace = require('./handlers/handleInSpace');
const handleMarioJudah = require('./handlers/handleMarioJudah');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) {
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
        ];

        for (const handler of handlers) {
            await handler(message);
        }
    }
}
