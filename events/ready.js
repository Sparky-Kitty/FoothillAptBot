const { dbPassword, guildId } = require('../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('foothill', 'manager', dbPassword, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data.sqlite',
});

const Macro = require('../models/Macro')(sequelize, Sequelize.DataTypes);
const Event = require('../models/Event')(sequelize, Sequelize.DataTypes);
// const Balance = require('../dbObjects')(sequelize, Sequelize.DataTypes);
const { Balance, Category, MonthlyBudget, Status, Transaction, UserBalance } = require('../dbObjects.js');
console.log("dbObjects.js")
// console.log(Balance)
console.log(Balance, Category, MonthlyBudget, Status, Transaction, UserBalance)
const { ThreadMemberFlags, Events } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {

		
	
// Database 
// const sequelize = new Sequelize('foothill', 'manager', 'dndnerds', {
// 	host: 'localhost',
// 	dialect: 'sqlite',
// 	logging: false,
// 	// SQLite only
// 	storage: 'data.sqlite',
// });

// Models

// Macro.sync()
// Event.sync()
// Balance.sync({ force: true })
// Category.sync({ force: true })
// MonthlyBudget.sync({ force: true })
// Status.sync({ force: true })
// Transaction.sync({ alter: true })
// UserBalance.sync({ force: true })
// sequelize.sync({ force: true })


		setInterval()

		const guild = client.guilds.cache.get(guildId);
		guild.members.fetch();
		guild.channels.fetch();
		// const channel = guild.channels.cache.get('1079333454304526417');
		// if (channel) return channel.send(`Ready! Logged in as ${client.user.tag}`);
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};