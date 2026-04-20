const cron = require('cron');
const CONSTANTS = require('../../../utils/constants.js');
const statsUtil = require('../../../utils/stats-util.js');
const logger = require('../../../utils/logger.js');
const responseWindowUtil = require('../../../utils/response-window-util.js');

const patriotAct = (client, tz, delayMs = CONSTANTS.CRON.PATRIOT_ACT_DELAY_PERIOD) => {
    return new cron.CronJob(CONSTANTS.CRON.PATRIOT_ACT, async () => {
        try {
            // add a small delay so the bot doesn't automatically post it at the exact time - give people some time to react
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }

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
                    responseWindowUtil.start(guild.id, 60000); // one minute
                    try {
                        await statsUtil.incrementSystemStat(CONSTANTS.STATS.PATRIOT_ACT);
                    } catch (e) {
                        logger.error('Failed to update patriot act stat:', e);
                    }
                } else {
                    logger.info('No suitable channel found in', guild.name);
                }
            }
        } catch (error) {
            logger.error('Error fetching servers or sending message:', error);
        }
    }, null, false, tz);
};

module.exports = patriotAct;
