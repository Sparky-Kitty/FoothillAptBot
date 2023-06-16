const { Events, userMention, GuildScheduledEventManager } = require("discord.js");
const moment = require('moment');
const tz = require('moment-timezone');

module.exports = {
	name: Events.ThreadUpdate,
	async execute(oldThread, newThread) {    
        guild = oldThread.guild;
		await guild.members.fetch();
        await guild.scheduledEvents.fetch();

        forumId = newThread.parentId;
        forum = guild.channels.cache.get('1079335217313095762');

        // if (forum.id == '1079335217313095762')

        pendingTag = forum.availableTags.find(t => t.name == "Pending")
        approvedTag = forum.availableTags.find(t => t.name == "Approved")
        deniedTag = forum.availableTags.find(t => t.name == "Denied")
        
        thread_author = guild.members.cache.get(newThread.ownerId)
        thread_name = newThread.name
        console.log('Forum: ' + forum.name)
        console.log('Thread: ' + thread_name)

        // If ride is approved
        // console.log('pendingTag.id: ' + pendingTag.id)
        // console.log('oldThread.appliedTags (map): ' + oldThread.appliedTags.map(t => forum.availableTags.find(a => a.id == t).name))
        // console.log('newThread.appliedTags (map): ' + newThread.appliedTags.map(t => forum.availableTags.find(a => a.id == t).name))
        // console.log('oldThread.appliedTags (toString(): ' + oldThread.appliedTags.toString())
        // console.log('newThread.appliedTags (toString(): ' + newThread.appliedTags.toString())
        // console.log('oldThread.appliedTags.indexOf(pendingTag): ' + oldThread.appliedTags.indexOf(pendingTag.id))
        // console.log('oldThread.appliedTags.indexOf(approvedTag): ' + oldThread.appliedTags.indexOf(approvedTag.id))
        // console.log('newThread.appliedTags.indexOf(pendingTag): ' + newThread.appliedTags.indexOf(pendingTag.id))
        // console.log('newThread.appliedTags.indexOf(approvedTag): ' + newThread.appliedTags.indexOf(approvedTag.id))
        oldPending = await oldThread.appliedTags.indexOf(pendingTag.id)
        // oldApproved = await oldThread.appliedTags.indexOf(approvedTag.id)
        // newPending = await newThread.appliedTags.indexOf(pendingTag.id)
        newApproved = await newThread.appliedTags.indexOf(approvedTag.id)
        if (newApproved != -1 && oldPending != -1) {
            try {
                console.log('thread_name: ' + thread_name)
                bob = new GuildScheduledEventManager();
                bob.
                thread_event = guild.scheduledEvents.cache.get(e => e.name == thread_name)
                console.log('event _name: ' + thread_event)
                if (thread_event) {
                    event_author = guild.members.cache.get(thread_event.creatorId)
                    await threadEvent.setName("[Approved Ride] " + guildScheduledEvent.name.substring(guildScheduledEvent.name.indexOf("]") + 1))
                    await newThread.setName("[Approved Ride] " + newThread.name.substring(newThread.name.indexOf("]") + 1))
                    message = newThread.fetchStarterMessage();
                    console.log('message: ' + message)
                    
                    event_data = thread_event.entityMetadata.location;
                    event_start = moment(guildScheduledEvent.scheduledStartAt);
                    embed = new EmbedBuilder()
                    .setColor(event_author.displayHexColor)
                    .setAuthor({ name: `${threadEvent.name}`, iconURL: `${event_author.user.avatarURL()}` })
                    .setImage(event_cover)
                    .addFields(
                        { name: '__Location:__', value: `${event_data}`, inline: false },
                        { name: '__When:__', value: `${event_start.tz('America/Los_Angeles').format("llll")} PST`, inline: true },
                    )
                    .setFooter("Last Updated ")
                    .setTimestamp();

                    message.edit({
                        content: `${userMention(event_author)}, your event is approved.`,
                        embeds: [embed]
                    })
                    .then(msg => console.log(`Updated the content of a message to ${msg.content}`))
                    .catch(console.error);
                }
              } catch (error) {
                console.error(error);
                // Expected output: ReferenceError: nonExistentFunction is not defined
                // (Note: the exact output may be browser-dependent)
              }
              
        }
	},
};