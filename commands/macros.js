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
		.setName('macros')
		.setDescription('Replies with a list of current macro reminders.'),
	async execute(interaction) {        
        const list = await Macro.findAll();
        let message = new String;
        list.forEach(m => {
            if (m.role2) {
                message += `\n${m.name} - (${roleMention(m.role)} & ${roleMention(m.role2)})`
            } else {
                message += `\n${m.name} - (${roleMention(m.role)})`
            }

            // if(m.role && m.role2) {
            //     message += `\n${m.name} will ping ${roleMention(m.role)} & ${roleMention(m.role)} with the message: ${m.message}`
            // } else if(m.role && !m.role2)  {
            //     message += `\n${m.name} will ping ${roleMention(m.role)} with the message: ${m.message}`
            // } else {
            //     message += `\n${m.name} will send the message: ${m.message}`
            // }         
        });

        await interaction.reply({ content: message, ephemeral: true });
	},
};