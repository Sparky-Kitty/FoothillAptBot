const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');const Sequelize = require('sequelize');

const sequelize = new Sequelize('foothill', 'manager', 'dndnerds', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'data.sqlite',
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pingdb')
		.setDescription('Tests the connection to the bot database.'),
	async execute(interaction) {
		try {
			await sequelize.authenticate();
			sequelize.close()			
			await interaction.reply('Connection has been established successfully.');
		  } catch (error) {
			
			await interaction.reply('Unable to connect to the database.');
			console.error('Unable to connect to the database:', error);
		  }
	}
};