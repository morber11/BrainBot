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

        const patriotAct = new cron.CronJob(CONSTANTS.CRON.PATRIOT_ACT, async () => {
            try {
                for (const guild of client.guilds.cache.values()) {
                    let targetChannel = guild.channels.cache.find(ch =>
                        ch.type === 0 && (ch.name.toLowerCase() === 'general'
                            || ch.name.toLowerCase().includes('bots')
                            || ch.name.toLowerCase().includes('bot')
                            || ch.name.toLowerCase().includes('2fort') // fuck it we ball
                            || ch.name.toLowerCase().includes('real-fungheads')) // help me get all the shen gong wu. should probably make these channel ids
                    );

                    if (targetChannel) {
                        await targetChannel.send('o7');
                    } else {
                        console.log("No suitable channel found in", guild.name);
                    }
                }
            } catch (error) {
                console.error('Error fetching servers or sending message:', error);
            }
        });

        // start our crons
        decrementDespair.start();
        patriotAct.start();
    }
};