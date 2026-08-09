const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const factOrFictionService = require('../../services/fact-or-fiction-service.js');
const factOrFictionOutcomeService = require('../../services/fact-or-fiction-outcome-service.js');
const cryptUtil = require('../../utils/crypt-util.js');
const pathUtility = require('../../utils/path-util.js');
const CONSTANTS = require('../../utils/constants.js');
const mathUtil = require('../../utils/math-util.js');
const logger = require('../../utils/logger.js');
const userStatCommandService = require('../../services/user-stat-command-service.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fact-or-fictionator')
        .setDescription('will you discover the truth? or get lost in the lies?')
        .addStringOption(option =>
            option.setName('url')
                .setDescription(`we'll find out if this url is fact or fiction at the end of the episode`)
                .setMaxLength(300)
                .setRequired(true),
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const url = interaction.options.getString('url');
            const { hash } = cryptUtil.getHash({ value: url });

            const [factOrFictionEntry, created] = await factOrFictionService.findOrCreate(hash);
            const outcome = factOrFictionOutcomeService.resolveFactOrFictionOutcome({
                existingValue: factOrFictionEntry.dataValues.value,
                created,
                valueRoll: mathUtil.getRandomInt(999),
                responseRoll: Math.random(),
            });

            if (outcome.shouldPersistValue) {
                await factOrFictionService.update(factOrFictionEntry.id, outcome.value);
            }

            const dir = pathUtility.getMediaFilePath(__dirname, 'images',
                outcome.value === CONSTANTS.FACT_OR_FICTION.VALUES.FACT ? 'fact/fact.gif' : 'fiction/fiction.gif');

            const attachment = new AttachmentBuilder(dir);

            // ideas
            // add a based on x events by y etc, column in db.
            // similar events took place in x location
            await interaction.editReply({
                content: `Did you manage to work it out? \nThe story in question: \`${url}\`\n${outcome.response}\n`,
                files: [attachment]
            });

            const userId = interaction.user && interaction.user.id;
            await userStatCommandService.incrementUserStat(userId, CONSTANTS.STATS.FACT_OR_FICTION, CONSTANTS.STATS.FACT_OR_FICTION_FRIENDLY);
        }
        catch (error) {
            logger.error('An error occurred.:', error);
            await interaction.reply({
                content: 'An error occurred.',
                ephemeral: true,
            });
        }
    }
};