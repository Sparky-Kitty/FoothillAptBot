const { SlashCommandBuilder, roleMention } = require('discord.js');
const { dbPassword } = require('./../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('foothill', 'manager', dbPassword, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data.sqlite',
});
const Macro = require('../models/Macro')(sequelize, Sequelize.DataTypes);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addmacro')
		.setDescription('Create a new preset for reminders.'),
	async execute(interaction) {        
        const list = await Macro.findAll();
        let message = new String;

        // list.forEach(m => {
        //     if(m.role) {
        //         message += `\n${m.name} will ping ${roleMention(m.role)} with the message: ${m.message}`
        //     } else {
        //         message += `\n${m.name} will send the message: ${m.message}`
        //     }        
        // });

        await interaction.reply({ content: message, ephemeral: true });
	},
};