const { SlashCommandBuilder } = require('discord.js');
const stringUtility = require('../../utils/string-util.js');
const CONSTANTS = require('../../utils/constants.js');
const statsUtil = require('../../utils/stats-util.js');
const logger = require('../../utils/logger.js');

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

            await statsUtil.incrementStat(CONSTANTS.STATS.GADGET, CONSTANTS.STATS.GADGET_FRIENDLY);

            await interaction.editReply(`Go Go Gadget ${el}!`);
        } catch (error) {
            logger.error(error);
            await interaction.editReply('An error occurred.');
        }
    }
};
