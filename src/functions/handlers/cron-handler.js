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

                    // we have to do this because of funky behaviour with .find() always finding bot/bots instead
                    let targetChannel = guild.channels.cache.find(ch =>
                        ch.type === 0 && (
                            ch.name.toLowerCase().includes('2fort') ||
                            ch.name.toLowerCase().includes('real-fungheads')
                        )
                    );

                    if (!targetChannel) {
                        targetChannel = guild.channels.cache.find(ch =>
                            ch.type === 0 && (
                                ch.name.toLowerCase().includes('bot') ||
                                ch.name.toLowerCase().includes('bots') ||
                                ch.name.toLowerCase() === 'general'
                            )
                        );
                    }

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


        // debug, run every minute to print info
        const debug = new cron.CronJob(CONSTANTS.CRON.DEBUG, async () => {
            try {
                for (const guild of client.guilds.cache.values()) {
                    console.log(`Guild: ${guild.name}`);
                    const targetChannel = guild.channels.cache.find(ch => ch.type === 0);
                    console.log("Channels in the guild:");
                    console.log(guild.channels.cache.map(ch => ch.name).join(', '));

                    if (targetChannel) {
                        console.log(`Target Channel found in ${guild.name}: ${targetChannel.name}`);
                    } else {
                        console.log(`No suitable channel found in ${guild.name}`);
                    }
                }
            } catch (error) {
                console.error('Error while fetching servers or sending messages:', error);
            }
        });


        // start our crons
        decrementDespair.start();
        patriotAct.start();
        //debug.start(); // uncomment if debug, eventually add this as a param on startup
    }
};