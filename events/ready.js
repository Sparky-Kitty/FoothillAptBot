const { guildId } = require('./../config.json');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		const guild = client.guilds.cache.get(guildId);
		guild.members.fetch();
		guild.channels.fetch();
		// const channel = guild.channels.cache.get('1079333454304526417');
		// if (channel) return channel.send(`Ready! Logged in as ${client.user.tag}`);
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};