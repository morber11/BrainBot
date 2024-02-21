const fs = require('fs');
const cron = require('cron');
const Member = require('../../dal/models/member');
const { Op } = require("sequelize");
const CONSTANTS = require('../../utils/constants.js');

module.exports = (client) => {
    client.handleCrons = async () => {
        const decrementDespair = new cron.CronJob(CONSTANTS.CRON.HANDLE_DESPAIR, async () => {
            const members = await Member.findAll();

            members.forEach(async (member) => {
                const { despairCount, id } = member;

                if (despairCount > 0)
                    await member.increment({ despairCount: CONSTANTS.POINT_VALUES.DESPAIR_DECREMENT });

                if (despairCount < 0) {
                    await Member.update({
                        despairCount: 0,
                        updatedAt: new Date(),
                    },
                        { where: { id: id } }
                    );
                }
            });
        });
        decrementDespair.start();
    }
};