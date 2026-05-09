const cron = require('cron');
const memberService = require('../../../services/member-service.js');
const CONSTANTS = require('../../../utils/constants.js');
const logger = require('../../../utils/logger.js');

const onTick = async () => {
    const members = await memberService.findAll();

    for (const member of members) {
        try {
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
        } catch (err) {
            logger.error('Failed to process member in decrement despair cron', { memberId: member && member.id, err });
        }
    }
};

// needed for async issues with onTick, 
// and also allows us to export the cron job 
// instance for testing
const decrementDespair = cron.CronJob.from({
    cronTime: CONSTANTS.CRON.HANDLE_DESPAIR,
    onTick,
    start: false,
    waitForCompletion: true,
});

module.exports = decrementDespair;
