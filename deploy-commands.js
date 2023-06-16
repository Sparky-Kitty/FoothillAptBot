const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes, StringSelectMenuBuilder } = require('discord.js');
const { clientId, guildId, token, dbPassword } = require('./config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('foothill', 'manager', dbPassword, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data.sqlite',
});

const Macro = require('./models/Macro')(sequelize, Sequelize.DataTypes);  



const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data);
}

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	// .then(async (data) => {
	// 	data.map(async command => {
	// 		console.log("command name: " + command.name)
	// 		if (command.name == "remind")
	// 		{
	// 			// Retrieve data from the database
	// 			const presets = await Macro.findAll();
	// 			const dataFromDatabase = await presets.map(preset => preset.get({ plain: true }));

	// 			// console.log("dataFromDatabase\n" + JSON.stringify(dataFromDatabase, null, 2));
			
	// 			// Format the data into choices for the ChoiceField
	// 			const choices = await dataFromDatabase.map(row => ({
	// 				value: row.id.toString(),
	// 				label: row.name
	// 			  }));
	// 			command.options[0].options[0].choices = choices;
	// 			// console.log(command.options[0].options[0].choices)
	// 		}
	// 	});
	// })
	.catch(console.error);