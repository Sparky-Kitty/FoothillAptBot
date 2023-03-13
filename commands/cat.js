const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const talkedRecently = new Set();
const request = require('request');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Replies with a random cat image.'),
	async execute(interaction) {
		if (talkedRecently.has(interaction.author)) {
			interaction.reply({ content: 'You are on cooldown', ephemeral: true });
		}
		else {
			// if (!interaction.message.member.roles.cache.some(r=>["Admin","Advisor"].includes(r.name)))
			// if (message.channel.id == "378488125611048960") return message.reply("Sorry. I can't use that command here.");  // Lounge
			interaction.channel.sendTyping();

			request('http://aws.random.cat/meow', (error, response, body) => {
				const json = JSON.parse(body);
				const embed = new EmbedBuilder()
					.setColor('#eb0054')
					.setImage(json.file);

				interaction.reply({ embeds: [embed] });
				interaction.channel.sendTyping(true);

				// End of cooldown Code
				talkedRecently.add(interaction.author);
				setTimeout(() => {
					// Removes the user from the set after a minute
					talkedRecently.delete(interaction.author);
				}, 5000);
			});
		}
	},
};