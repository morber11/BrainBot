const fs = require('node:fs');
const path = require('node:path');
const pathUtility = require('../../utils/path-util.js');
const CONSTANTS = require('../../utils/constants.js');
const Member = require('../../dal/models/member.js');
const Keyword = require('../../dal/models/keyword.js');
const CustomUrl = require('../../dal/models/custom-url.js');
const stringUtility = require('../../utils/string-util.js');
const ask = require('../../utils/ask-util.js');
const logger = require('../../utils/logger.js');
const mathUtil = require('../../utils/math-util.js');
const statsUtil = require('../../utils/stats-util.js');

const lastRavenByGuild = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) {
            return;
        }

        // some of these rely on msg content (for example - what guild they are in) 
        // so we'll handle .toLowerCase() inside the handlers
        // consider changing later
        const handlers = [
            handleBasicReactResponse,
            handleMilk,
            handleJigsaw,
            handleRaven,
            handleMentalDespair,
            handleAsking,
            handleInSpace,
        ];

        for (const handler of handlers) {
            await handler(message);
        }
    }
}

async function handleBasicReactResponse(message) {
    try {
        const msgContent = message.content.toLowerCase();

        if (msgContent.includes("brain")) {
            message.react(CONSTANTS.EMOJI.BRAIN)
            await statsUtil.incrementStat(CONSTANTS.STATS.BRAIN, CONSTANTS.STATS.BRAIN_FRIENDLY);
        }

        if (msgContent.includes(CONSTANTS.EMOJI.BRAIN)) {
            message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_B);
            message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_R);
            message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_A);
            message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_I);
            message.react(CONSTANTS.EMOJI.REGIONAL_SIGN_N);
            await statsUtil.incrementStat(CONSTANTS.STATS.BRAIN, CONSTANTS.STATS.BRAIN_FRIENDLY);
        }

        const re = new RegExp("^umm*");
        if (re.test(msgContent))
            message.react(CONSTANTS.EMOJI.THINKING);

        // we dont need i18n, we only need one spanish word
        if (msgContent.includes("maricon") || msgContent.includes("maricón"))
            message.react(CONSTANTS.EMOJI.ONE_HUNDRED);

    } catch (err) {
        logger.error(err, {
            guildId: message.guildId,
            channelId: message.channelId,
            messageId: message.id,
            authorId: message.author.id,
            handler: 'handleBasicReactResponse'
        });
    }
}

async function handleMilk(message) {
    try {
        const msgContent = message.content.toLowerCase();
        if (!(msgContent.includes("milk") || msgContent.includes(CONSTANTS.EMOJI.MILK))) return;

        const dir = pathUtility.getMediaFilePath(__dirname, 'audio', 'milk03.mp3');

        await statsUtil.incrementStat(CONSTANTS.STATS.MILK, CONSTANTS.STATS.MILK_FRIENDLY);
        await message.reply({ files: [dir] });
    } catch (err) {
        logger.error(err, { handler: 'handleMilk' });
    }
}

async function handleJigsaw(message) {
    try {
        const msgContent = message.content.toLowerCase();
        if (!msgContent.includes("make your choice")) return;

        const dir = pathUtility.getMediaFilePath(__dirname, 'images', 'jigsaw.jpg');

        await statsUtil.incrementStat(CONSTANTS.STATS.JIGSAW, CONSTANTS.STATS.JIGSAW_FRIENDLY);
        await message.reply({ files: [dir] });
    } catch (err) {
        logger.error(err, { handler: 'handleJigsaw' });
    }
}

async function handleRaven(message) {
    try {
        const msgContent = message.content.toLowerCase();
        if (!msgContent.includes("lost a life")) return;

        const ravenImages = ['raven-1.gif', 'raven-2.gif', 'raven-3.gif'];

        const guildKey = message.guildId || 'dm';
        const lastForGuild = lastRavenByGuild.get(guildKey);

        const choices = lastForGuild ? ravenImages.filter(img => img !== lastForGuild) : ravenImages;
        const selection = choices[Math.floor(Math.random() * choices.length)];

        lastRavenByGuild.set(guildKey, selection);

        const dir = pathUtility.getMediaFilePath(__dirname, 'images', selection);

        await statsUtil.incrementStat(CONSTANTS.STATS.RAVEN, CONSTANTS.STATS.RAVEN_FRIENDLY);
        await message.reply({ files: [dir] });

    } catch (err) {
        logger.error(err, { handler: 'handleRaven' });
    }
}

async function handleMentalDespair(message) {
    try {
        await parseMentalDespairKeywords(message);

        const currentDespair = await Member.findOne({
            attributes: ['despairCount'],
            where: {
                id: message.author.id,
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
    } catch (err) {
        logger.error(err, {
            guildId: message.guildId,
            channelId: message.channelId,
            messageId: message.id,
            authorId: message.author.id,
            handler: 'handleMentalDespair'
        });
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

async function handleAsking(message) {
    try {
        if (!message.guild) return;

        await ask.chanceToSend(message);
    } catch (err) {
        logger.error(err, {
            guildId: message.guildId,
            channelId: message.channelId,
            messageId: message.id,
            authorId: message.author.id,
            handler: 'handleAsking'
        });
    }
}

async function handleInSpace(message) {
    try {
        const msgContent = message.content.toLowerCase();

        if (!msgContent.includes('in space')) return;

        const count = mathUtil.getRandomInt(6) + 5;
        const phrase = 'in space no one can hear you in space';
        const response = Array(count).fill(phrase).join(' ');

        await message.reply(response);
    } catch (err) {
        logger.error(err, { handler: 'handleInSpace' });
    }
}

