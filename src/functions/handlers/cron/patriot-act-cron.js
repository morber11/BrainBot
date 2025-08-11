const cron = require('cron');
const CONSTANTS = require('../../../utils/constants.js');

const patriotAct = (client) => new cron.CronJob(CONSTANTS.CRON.PATRIOT_ACT, async () => {
    try {
        for (const guild of client.guilds.cache.values()) {
            // we have to do this because of funky behaviour with .find() always finding bot/bots instead
            // manually force priority on these special channels
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
                console.log('No suitable channel found in', guild.name);
            }
        }
    } catch (error) {
        console.error('Error fetching servers or sending message:', error);
    }
});

module.exports = patriotAct;
