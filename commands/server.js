/* eslint-disable no-const-assign */
const { SlashCommandBuilder, EmbedBuilder, time } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Replies with server info!'),
	async execute(interaction) {
		const member = interaction.member;
		const guild = interaction.guild;
		await guild.members.fetch();
		const owner = guild.members.cache.get(guild.ownerId);
		// const date = new Date()

		const exampleEmbed = new EmbedBuilder()
			.setColor(member.displayHexColor)
			.setThumbnail(guild.iconURL())
			.setAuthor({ name: guild.name, iconURL: owner.displayAvatarURL() })
			.addFields(
				{ name: 'Owner', value: owner.user.tag, inline: true },
				{ name: 'Members', value: guild.memberCount.toString(), inline: true },
				// { name: 'Region', value: guild.region, inline: true },
				{ name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
				{ name: 'Roles', value: guild.roles.cache.size.toString(), inline: false },
				{ name: 'Created At', value: time(guild.createdAt), inline: false },
				{ name: 'Verification Level', value: guild.verificationLevel.toString(), inline: false },
				{ name: 'Explicit Content Filter', value: guild.explicitContentFilter.toString(), inline: false },
			)
			.setTimestamp()
			.setFooter({ text: `Requested by: ${member.user.username}` });

		await interaction.reply({ embeds: [exampleEmbed] });
	},
};