const { SlashCommandBuilder } = require('discord.js');
const stringUtility = require('../../utils/string-util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('brain')
		.setDescription('brain brain brain brain brain')
        .addStringOption(option =>
            option.setName('brains')
                .setDescription('number of brains')
                .setMaxLength(3)
        ),
	async execute(interaction) {
        var numBrains = interaction.options.getString('brains');
        var message = '';

        if(stringUtility.isNumeric(numBrains)) {
            if (numBrains > 330)
                numBrains = 330;

            for(var i = 0; i < numBrains; ++i)
                message += 'brain '
        }
        else 
            message = 'brain brain brain brain';

        message.trimEnd();

		await interaction.reply(message);
	},
};

