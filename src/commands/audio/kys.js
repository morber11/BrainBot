const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kys')
		.setDescription('young man'),
	async execute(interaction) {
        const { joinVoiceChannel, createAudioPlayer, createAudioResource, generateDependencyReport } = require('@discordjs/voice');
        
        const url = 'https://www.youtube.com/watch?v=SQsmW0mMKZc'
        const stream = ytdl(url, {filter: 'audioonly'});
        const player = createAudioPlayer();
        const resource = createAudioResource(stream);

        const guildMember = await interaction.member.guild.members.fetch(interaction.user.id);
        
        const connection = joinVoiceChannel({
        	channelId: guildMember.voice.channelId,
        	guildId: interaction.guildId,
        	adapterCreator: interaction.channel.guild.voiceAdapterCreator,
        });

        connection.subscribe(player);
        player.play(resource);

        await interaction.reply("young man");
        //console.log(generateDependencyReport());
	},
};