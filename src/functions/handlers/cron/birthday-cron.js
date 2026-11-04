const cron = require('cron');
const { ChannelType, RESTJSONErrorCodes } = require('discord.js');
const birthdayService = require('../../../services/birthday-service.js');
const CONSTANTS = require('../../../utils/constants.js');
const logger = require('../../../utils/logger.js');

// returns false if the user has left the guild
// since birthdays only happen once a year
async function isStillMember(guild, userId) {
    try {
        // force skips the member cache, which is never told about leaves without the GuildMembers intent
        await guild.members.fetch({ user: userId, force: true });
        return true;
    } catch (err) {
        if (err.code === RESTJSONErrorCodes.UnknownMember) {
            return false;
        }

        throw err;
    }
}

function findChannel(guild) {
    const birthdayChannel = guild.channels.cache.find(ch =>
        ch.type === ChannelType.GuildText && ch.name.toLowerCase() === CONSTANTS.GENERAL_CHANNEL
    );

    if (birthdayChannel) {
        return birthdayChannel;
    }

    return guild.systemChannel;
}

async function celebrate(client, birthday) {
    const { guildId, userId } = birthday;

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        logger.info('bot is no longer in birthday guild', { guildId });
        return;
    }

    const isMember = await isStillMember(guild, userId);
    if (!isMember) {
        await birthdayService.removeBirthday(guildId, userId);
        logger.warn('birthday user left the guild, removing birthday', { guildId, userId });
        return;
    }

    const channel = findChannel(guild);
    if (!channel) {
        logger.info('no channel for birthday message', { guildId });
        return;
    }

    await channel.send(`It is <@${userId}>'s birthday today... Happy Birthday <@${userId}>!!! 🎉🎂🥳🎈🎊`);
}

const onTick = async (client) => {
    const birthdays = await birthdayService.findBirthdaysOn(new Date());

    for (const birthday of birthdays) {
        try {
            await celebrate(client, birthday);
        } catch (err) {
            logger.error('failed to send birthday message', { guildId: birthday.guildId, userId: birthday.userId, err });
        }
    }
};

const birthdayCron = (client, tz) => cron.CronJob.from({
    cronTime: CONSTANTS.CRON.BIRTHDAY,
    onTick: () => onTick(client),
    start: false,
    waitForCompletion: true,
    timeZone: tz,
});

module.exports = birthdayCron;
module.exports.celebrate = celebrate;
