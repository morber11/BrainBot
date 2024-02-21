const fs = require('node:fs');
const path = require('node:path');
const pathUtility = require('../../utils/path-util.js');
const CONSTANTS = require('../../utils/constants.js');
const Member = require('../../dal/models/member.js');
const Keyword = require('../../dal/models/keyword.js');
const CustomUrl = require('../../dal/models/custom-url.js');
const stringUtility = require('../../utils/string-util.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.id == client.application.id)
            return;

        await handleBasicReactResponse(message);
        await handleMentalDespair(message);
    }
}

async function handleBasicReactResponse(message) {
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
    if (re.test(msgContent))
        message.react(CONSTANTS.EMOJI.THINKING);

    // we dont need i18n, we only need one spanish word
    if (msgContent.includes("maricon") || msgContent.includes("maricón"))
        message.react(CONSTANTS.EMOJI.ONE_HUNDRED);

    if (msgContent.includes("milk")) {
        const dir = pathUtility.getMediaFilePath(__dirname, 'audio', 'milk03.mp3');
        try {
            await message.reply({
                files: [dir]
            });
        } catch (err) {
            console.log("Error during File read " + err);
        }
    }
}

async function handleMentalDespair(message) {
    await parseMentalDespairKeywords(message);

    const currentDespair = await Member.findOne({
        attributes: ['despairCount'],
        where: {
            id: await message.author.id,
        }
    });

    if (!currentDespair)
        return;

    if (currentDespair.despairCount >= CONSTANTS.POINT_VALUES.MAX_DESPAIR) {
        const urls = await CustomUrl.findAll({
            attributes: ['url'],
            where: { type: 'despair' },
            raw: true
        });

        const el = stringUtility.selectRandomFromArray(urls);

        await message.reply(`Your despair is too high! \n${el.url}`);
    }
}

async function parseMentalDespairKeywords(message) {
    const messageContent = message.content.toLowerCase();

    const keywords = await Keyword.findAll({
        attributes: ['name', 'value'],
        where: { type: 'despair' },
        raw: true
    });

    const keywordsMap = new Set(keywords.map((k) => k.name));

    let despairCount = 0;
    messageContent.split(" ").forEach((w) => {
        if (keywordsMap.has(w)) {
            var kw = keywords.find(x => x.name === w)
            despairCount += kw.value != null ? kw.value : 1
        }


    });

    if (despairCount != 0) {
        const [member, created] = await Member.findOrCreate({
            where: {
                id: message.author.id,
            }
        });

        if (!created) {
            const newCount = member.despairCount + despairCount;

            await Member.update({
                name: message.author.username,
                despairCount: newCount > 0 ? newCount : 0,
                updatedAt: new Date(),
            },
                { where: { id: member.id } }
            );
        }
    }
}
