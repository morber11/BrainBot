const cron = require('cron');
const CONSTANTS = require('../../../utils/constants.js');
const Stat = require('../../../dal/models/stat');

const patriotAct = (client) => new cron.CronJob(CONSTANTS.CRON.PATRIOT_ACT, async () => {
    try {
        // add a small delay so the bot doesn't automatically post it at the exact time - give people some time to react
        const delay = CONSTANTS.CRON.PATRIOT_ACT_DELAY_PERIOD;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const [statRow] = await Stat.findOrCreate({
            where: { stat: CONSTANTS.STATS.PATRIOT_ACT },
            defaults: { count: 0 },
        });
        
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
                try {
                    await statRow.increment('count');
                } catch (e) {
                    console.error('Failed to update patriot act stat:', e);
                }
            } else {
                console.log('No suitable channel found in', guild.name);
            }
        }
    } catch (error) {
        console.error('Error fetching servers or sending message:', error);
    }
});

module.exports = patriotAct;
