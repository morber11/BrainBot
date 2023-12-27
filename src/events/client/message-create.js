const fs = require('node:fs');
const path = require('node:path'); 
const pathUtility = require('../../utils/path-util.js');
const CONSTANTS =  require('../../utils/constants.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {

        if (message.author.id == client.application.id)
            return;
        
        const msgContent = message.content.toLowerCase();

        if (msgContent.includes("brain")) 
            message.react(CONSTANTS.EMOJI.BRAIN)
        if (msgContent.includes(CONSTANTS.EMOJI.BRAIN)) {
            message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_B);
            message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_R);
            message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_A);
            message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_I);
            message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_N);
        }

        const re = new RegExp("^umm*");
        if (msgContent.match(re))
            message.react(CONSTANTS.EMOJI.THINKING);

        // we dont need i18n, we only need one spanish word
        if (msgContent.includes("maricon") || msgContent.includes("maricón"))
            message.react(CONSTANTS.EMOJI.ONE_HUNDRED);

        if (msgContent.includes("milk")) {
            const dir = pathUtility.getMediaFilePath(__dirname, 'audio', 'milk03.mp3');
            await message.reply({
                files: [dir]
            }).catch((err) => {
                 console.log("Error during Export File " + err);
            });;
        }
    }
}