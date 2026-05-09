const cron = require('cron');
const memberService = require('../../../services/member-service.js');
const CONSTANTS = require('../../../utils/constants.js');

const decrementDespair = new cron.CronJob(CONSTANTS.CRON.HANDLE_DESPAIR, async () => {
    const members = await memberService.findAll();

    members.forEach(async (member) => {
        const { despairCount, id } = member;

        if (despairCount > 0) {
            // this is some sort of insane syntax but it works anyway
            await member.increment({ despairCount: CONSTANTS.POINT_VALUES.DESPAIR_DECREMENT });
        }

        if (despairCount < 0) {
            await memberService.update(id, {
                despairCount: 0,
                updatedAt: new Date(),
            });
        }
    });
});

module.exports = decrementDespair;
