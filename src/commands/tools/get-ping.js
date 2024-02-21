const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_current_ping')
        .setDescription('Returns a ping and latency'),
    async execute(interaction, client) {
        const { createdTimestamp } = await interaction.deferReply({
            fetchReply: true
        });

        const { ping } = client.ws;

        const newMessage = `API Latency: ${ping}\nClient Ping: ${Date.now() - createdTimestamp}`;
        await interaction.editReply({
            content: newMessage
        });
    }
};