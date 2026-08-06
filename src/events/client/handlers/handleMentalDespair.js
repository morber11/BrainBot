const memberService = require('../../../services/member-service.js');
const keywordService = require('../../../services/keyword-service.js');
const customUrlService = require('../../../services/custom-url-service.js');
const despairScoreService = require('../../../services/despair-score-service.js');
const stringUtility = require('../../../utils/string-util.js');
const CONSTANTS = require('../../../utils/constants.js');
const logger = require('../../../utils/logger.js');

module.exports = async function handleMentalDespair(message) {
    try {
        await parseMentalDespairKeywords(message);

        const currentDespair = await memberService.findOne(message.author.id, {
            attributes: ['despairCount'],
        });

        if (!currentDespair) return;

        if (currentDespair.despairCount >= CONSTANTS.POINT_VALUES.MAX_DESPAIR) {
            const urls = await customUrlService.findAllByType('despair', ['url']);

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
};

async function parseMentalDespairKeywords(message) {
    const keywords = await keywordService.findAllByType('despair', ['name', 'value']);
    const change = despairScoreService.calculateDespairChange({
        content: message.content,
        keywords,
        currentCount: 0,
    });

    if (change.delta !== 0) {
        const [member, created] = await memberService.findOrCreate(message.author.id);

        if (!created) {
            const updatedDespair = despairScoreService.calculateNextDespairCount({
                currentCount: member.despairCount,
                delta: change.delta,
            });

            await memberService.update(member.id, {
                name: message.author.username,
                despairCount: updatedDespair.nextCount,
                updatedAt: new Date(),
            });
        }
    }
}
