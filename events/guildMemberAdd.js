/* eslint-disable no-inline-comments */
// const { Client, EmbedBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'guildMemberAdd',
	execute(member) {
		const guild = member.guild;
		const greetChannel = guild.channels.cache.get('853914718682873868'); // #peasant-chatter
		const memberRole = guild.roles.cache.find(role => role.name == 'Guest');
		const mtag = member.user.tag;

		// console.log("Role: " + memberRole + "\n------\nLog: " + logChannel + "\n------\nGreet: " + greetChannel)
		if (greetChannel && memberRole) {
			member.roles.add(memberRole);

			const greetEmbed = new EmbedBuilder()
				.setColor('#eb0054')
				.setAuthor({ name: mtag, iconURL: `${member.user.avatarURL()}` })
				.addFields(
					{ name: 'Thanks for Joining', value: 'Welcome to our house server. Please don\'t hesistate to ask for help, and we look forward to hanging out with you.', inline: false },
				)
				.setFooter({ text: `Member ID : ${member.id}` })
				.setTimestamp();
			greetChannel.send({ content: `<@${member.id}>`, embeds: [greetEmbed] });
			return console.log('Success to GuildMemberAdd');
		}
		else {
			return;
		}
	},
};