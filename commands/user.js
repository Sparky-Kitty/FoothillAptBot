const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// const { relativeTimeRounding } = require('moment');
const moment = require('moment');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Replies with user info!')
		.addUserOption(option =>
			option.setName('member')
				.setDescription('The user to lookup')
				.setRequired(false)),
	async execute(interaction) {
		await interaction.guild.members.fetch();
		let member = interaction.member;
		console.log("Interaction member: " + member)
		try {
			memberString = interaction.options.get('member').value;
			member = interaction.guild.members.cache.get(memberString);
		}
		catch (error) {
			console.log(error)
		}
		// if (interaction.option.first(n => n.name == 'member').value) {
		// 	const confirm_member = member.guild.members.cache.first(m => m. = interaction.option.first(n => n.name == 'member').value);
		// 	if (confirm_member) member = confirm_member;
		// }
		const exampleEmbed = new EmbedBuilder()
			.setColor(member.displayHexColor)
			.setThumbnail(`${member.user.displayAvatarURL()}`)
			.setAuthor({ name: `${member.user.tag} (${member.id})`, iconURL: `${member.user.avatarURL()}` })
			.addFields(
				{ name: 'Nickname', value: member.nickname ? member.nickname : 'No nickname', inline: true },
				{ name: 'Status', value: member.presence?.status ? member.presence.status : 'unable to detect status', inline: true },
				{ name: 'Playing', value: member.presence?.activities ? member.presence.activities.first().name : 'not playing anything', inline: true },
				{ name: 'Roles', value: `${member.roles.cache.filter(r => r.id !== interaction.guild.id).map(roles => `\`${roles.name}\``).join(' **|** ') || 'No Roles'}`, inline: false },
				{ name: 'Joined At', value: `${moment.utc(member.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss')} UTC`, inline: true },
				{ name: 'Created At', value: `${moment.utc(member.user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')} UTC`, inline: true },
			)
			.setTimestamp()
			.setFooter({ text: `Requested by: ${interaction.member.user.username}` });

		await interaction.reply({ embeds: [exampleEmbed] });
	},
};