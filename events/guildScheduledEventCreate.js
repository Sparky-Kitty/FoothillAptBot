const { ThreadAutoArchiveDuration, EmbedBuilder, GuildScheduledEventEntityType, roleMention } = require("discord.js");
const moment = require('moment');
const tz = require('moment-timezone');

module.exports = {
	name: 'guildScheduledEventCreate',
	async execute(guildScheduledEvent) {
        guild = guildScheduledEvent.guild;
		await guild.members.fetch();
        event_author = guild.members.cache.get(guildScheduledEvent.creatorId)

        await guildScheduledEvent.setName("[Pending Ride]" + guildScheduledEvent.name.substring(guildScheduledEvent.name.indexOf(":") + 1))
        .catch(error => console.log(error));
        event_name = guildScheduledEvent.name        
        event_desc = guildScheduledEvent.description;
        event_start = moment(guildScheduledEvent.scheduledStartAt);
        event_end = moment(guildScheduledEvent.scheduledEndAt);
        if (guildScheduledEvent.coverImageURL) {
            event_cover = guildScheduledEvent.coverImageURL({size: 800});
        } else {
            event_cover = null
        }
        event_url = guildScheduledEvent.url;

        if (event_name.startsWith("[Pending Ride]")) {
            forum_channel = guild.channels.cache.get("1079335217313095762"); // for rideshare

            if (event_author.id == "395248731257044992") {
            // if (event_author.id == "395248731257044992" & guildScheduledEvent.name.toLowerCase().contains("test")) {
                // forum_channel = guild.channels.cache.get("1111443497749331968"); // for dev-rideshare
            } else {
                forum_channel = guild.channels.cache.get("1079335217313095762"); // for rideshare
            }
    
            if (guildScheduledEvent.entityType == GuildScheduledEventEntityType.External) {
                event_data = guildScheduledEvent.entityMetadata.location;
                embed = new EmbedBuilder()
                .setColor(event_author.displayHexColor)
                .setAuthor({ name: `${event_name}`, iconURL: `${event_author.user.avatarURL()}` })
                .setImage(event_cover)
                .addFields(
                    { name: '__Location:__', value: `${event_data}`, inline: false },
                    { name: '__When:__', value: `${event_start.tz('America/Los_Angeles').format("llll")} PST`, inline: true },
                )
                .setTimestamp();
            }

            forum_channel.threads.create({
                name: `${event_name}`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                message: {
                    // content: `${events_role.toString()}\n${event_name} was created by: ${event_author}.`, // Pings Events role.
                    content: `${roleMention('1079305338194509824')}\n${event_author.displayName} needs a ride.`,
                    embeds: [embed]
                },
                reason: 'New Ride Request',
                appliedTags: [forum_channel.availableTags.find(t => t.name == "Pending").id]
    
            }).then(thread => {
                // members = member_role.members;
                // members.map(async member => {
                //     thread.members.add(member);
                // })
                // for (member in members) {
                //     thread.members.add(member);
                // }
                console.log(thread)
            })
            .catch(error => console.log(error))
            return;
        }

        // events_role = guild.roles.cache.get("1022651694263312435");
        // member_role = guild.roles.cache.get("1021987976793837599");
	},
};