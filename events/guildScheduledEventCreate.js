// const { ThreadAutoArchiveDuration, EmbedBuilder, GuildScheduledEventEntityType, Client } = require("discord.js");
// const moment = require('moment');
// const tz = require('moment-timezone');

module.exports = {
// 	name: 'guildScheduledEventCreate',
// 	async execute(guildScheduledEvent) {
// 		const guild = guildScheduledEvent.guild;
// 		const forum_channel = guild.channels.cache.get("1022958594301378591"); // for test-forum
// 		await guild.members.fetch();
// 		const event_author = guild.members.cache.get(guildScheduledEvent.creatorId)

	// 		const events_role = guild.roles.cache.get("1022651694263312435");
	// 		const member_role = guild.roles.cache.get("1021987976793837599");
	// 		event_name = guildScheduledEvent.name
	// 		event_desc = guildScheduledEvent.description;
	// 		event_author = guild.members.cache.get(guildScheduledEvent.creatorId);
	// 		event_start = moment(guildScheduledEvent.scheduledStartAt);
	// 		event_end = moment(guildScheduledEvent.scheduledEndAt);
	// 		event_cover = guildScheduledEvent.coverImageURL({size: 800});
	// 		event_url = guildScheduledEvent.url;

	// 		if (guildScheduledEvent.entityType == GuildScheduledEventEntityType.Voice) {
	// 			event_data = guildScheduledEvent.channel;
	// 			embed = new EmbedBuilder()
	// 				.setColor(event_author.displayHexColor)
	// 				.setAuthor({ name: `${event_author.displayName} is hosting an event!`, iconURL: `${event_author.user.avatarURL()}` })
	// 				.setImage(event_cover)
	// 				.addFields(
	// 					{ name: '__Name:__', value: `${event_name}`, inline: true },
	// 					{ name: '__Location:__', value: `${event_data}`, inline: true },
	// 					{ name: '__Starts:__', value: `${event_start.tz('America/Los_Angeles').format("llll")} PST`, inline: true },
	// 				)
	// 				.setDescription(`**Description:**\n${event_desc}\n\n**Links:**\n[Discord](${event_url})`)
	// 				.setTimestamp();
	// 		}
	// 		else if (guildScheduledEvent.entityType == GuildScheduledEventEntityType.External) {
	// 			event_data = guildScheduledEvent.entityMetadata.location;
	// 			embed = new EmbedBuilder()
	// 				.setColor(event_author.displayHexColor)
	// 				.setAuthor({ name: `${event_author.displayName} is hosting an event!`, iconURL: `${event_author.user.avatarURL()}` })
	// 				.setImage(event_cover)
	// 				.addFields(
	// 					{ name: '__Name:__', value: `${event_name}`, inline: false },
	// 					{ name: '__Location:__', value: `${event_data}`, inline: false },
	// 					{ name: '__Starts:__', value: `${event_start.tz('America/Los_Angeles').format("llll")} PST`, inline: true },
	// 					{ name: '__Ends:__', value: `${event_end.tz('America/Los_Angeles').format("llll")} PST`, inline: true },
	// 				)
	// 				.setDescription(`**Description:**\n${event_desc}\n\n**Links:**\n[Discord](${event_url})`)
	// 				.setTimestamp();
	// 		}

	// 		forum_channel.threads.create({
	// 			name: `${event_name} [${guildScheduledEvent.scheduledStartAt.toLocaleString('default', { month: 'short' })} ${guildScheduledEvent.scheduledStartAt.getDate()}]`,
	// 			autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
	// 			message: {
	// 				content: `${events_role.toString()}\n${event_name} was created by: ${event_author}.`, // Pings Events role.
	// 				embeds: [embed]
	// 			},
	// 			reason: 'New Event!',
	// 			appliedTags: [forum_channel.availableTags.find(t => t.name == "Virtual").id]

// 		}).then(thread => {
// 			// members = member_role.members;
// 			// members.map(async member => {
// 			//     thread.members.add(member);
// 			// })
// 			// for (member in members) {
// 			//     thread.members.add(member);
// 			// }
// 			console.log(thread)
// 		})
// 			.catch(console.error())
// 		return;
// 	},
};