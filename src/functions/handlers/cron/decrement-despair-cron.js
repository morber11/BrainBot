const cron = require('cron');
const Member = require('../../../dal/models/member.js');
const CONSTANTS = require('../../../utils/constants.js');

const decrementDespair = new cron.CronJob(CONSTANTS.CRON.HANDLE_DESPAIR, async () => {
    const members = await Member.findAll();

    members.forEach(async (member) => {
        const { despairCount, id } = member;

        if (despairCount > 0) {
            // this is some sort of insane syntax but it works anyway
            await member.increment({ despairCount: CONSTANTS.POINT_VALUES.DESPAIR_DECREMENT });
        }

        if (despairCount < 0) {
            await Member.update(
                { despairCount: 0, updatedAt: new Date() },
                { where: { id } }
            );
        }
    });
});

module.exports = decrementDespair;
