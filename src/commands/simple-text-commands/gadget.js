const { SlashCommandBuilder } = require('discord.js');
const stringUtility = require('../../utils/string-util.js');
const CONSTANTS = require('../../utils/constants.js');
const userStatCommandService = require('../../services/user-stat-command-service.js');
const statService = require('../../services/system-stat-command-service.js');
const logger = require('../../utils/logger.js');
const pathUtility = require('../../utils/path-util.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gadget')
        .setDescription('go go gadget!'),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            // https://inspectorgadget.fandom.com/wiki/Category:Gadget%27s_Gadgets
            // don't really want to clutter the CONSTANTS file with a huge list
            // these are only used in this command
            // TODO: consider mapping these to an image of the gadget
            const el = stringUtility.selectRandomFromArray([
                'arms',
                'copter',
                'binoculars',
                'brella',
                'chronograph watch',
                'clock',
                'coat',
                'cuffs',
                'domelight',
                'ears',
                'fan',
                'grappling hook',
                'hands',
                'lasso',
                'legs',
                'magnifying glass',
                'mallet',
                'neck',
                'parachute',
                'scissors',
                'skates',
                'skis',
                'springs',
                'wind sail',
                'phone',
                // custom ones now
                'gun'
            ]);

            const messageText = `Go Go Gadget ${el}!`;

            const baseName = el.toLowerCase().replace(/\s+/g, '-');
            const imgPath = pathUtility.getMediaFilePath(__dirname, 'images', `gadgets/${baseName}.jpg`);
            
            try {
                await interaction.editReply({ content: messageText, files: [imgPath] });
            } catch (err) {
                logger.warn(err, { handler: 'gadget', stage: 'attach-image' });
                await interaction.editReply(messageText);
            }

            const userId = interaction.user && interaction.user.id;
            await userStatCommandService.incrementUserStat(userId, CONSTANTS.STATS.GADGET, CONSTANTS.STATS.GADGET_FRIENDLY);
            await statService.incrementSystemStat(CONSTANTS.STATS.GADGET, CONSTANTS.STATS.GADGET_FRIENDLY);
        } catch (error) {
            logger.error(error);
            await interaction.editReply('An error occurred.');
        }
    }
};
