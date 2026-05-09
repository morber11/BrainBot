const { SlashCommandBuilder } = require('discord.js');
const memberService = require('../../services/member-service.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('despair')
        .setDescription('aaaaaaaaaaaaaaaaaaaaaa'),
    async execute(interaction) {
        await interaction.deferReply();

        const { id, username } = interaction.user;

        var [member, created] = await memberService.findOrCreate(id);

        if (!created) {
            await memberService.update(id, {
                name: username,
            });
        }

        await interaction.editReply(`Your mental despair is: ${member.dataValues.despairCount}`);
    }
};