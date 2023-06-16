const { dbPassword } = require('../config.json');
const Canvas = require('@napi-rs/canvas');
const { ModalBuilder,    ButtonComponent, ButtonStyle, ButtonBuilder, TextInputBuilder, StringSelectMenuOptionBuilder, TextInputComponent, ContextMenuCommandBuilder, ApplicationCommandType, ActionRow, StringSelectMenuBuilder, IntegrationApplication, TextInputStyle, ActionRowBuilder } = require('discord.js');
const Sequelize = require('sequelize');
const Op = require('sequelize').Op
const sequelize = new Sequelize('foothill', 'manager', dbPassword, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data.sqlite',
});

const Macro = require('../models/Macro')(sequelize, Sequelize.DataTypes);  


module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName('Event Create')
        .setType(ApplicationCommandType.Message),   
    
    async execute(interaction) {     
        let message = new String;
        await interaction.guild.members.fetch();
        await interaction.guild.channels.fetch();

        const { displayName } = interaction.member;
        console.log(displayName)
        
		// Create the modal
		const modal = new ModalBuilder()
        .setCustomId('eventCreationModal')
        .setTitle('Create Event');

        // Add components to modal
        const event_name_field = new TextInputBuilder()
            .setCustomId('event_name')
            .setLabel('Event Name')
            .setPlaceholder('Example: Work, Appointment at Place, Class')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);       
        const event_location_field = new TextInputBuilder()
            .setCustomId('event_location')
            .setLabel('Event Location')
            .setPlaceholder('Example: Address, Place Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);               
        const event_start_field = new TextInputBuilder()
            .setCustomId('event_start')
            .setLabel('Event Start Date')
            .setPlaceholder('Example: May-31-2023 11:15')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);        
        const event_end_field = new TextInputBuilder()
            .setCustomId('event_end')
            .setLabel('Event End')
            .setPlaceholder('Example: June-01-2023 19:30')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const event_recurring_field = new TextInputBuilder()
            .setCustomId('event_recurring')
            .setLabel('Recurring Event?')
            .setPlaceholder('Example: Daily x6, Weekly x3, Monthly x2')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(event_name_field);
        const secondActionRow = new ActionRowBuilder().addComponents(event_location_field);
        const thirdActionRow = new ActionRowBuilder().addComponents(event_start_field);
        const fourthActionRow = new ActionRowBuilder().addComponents(event_end_field);
        const fifthActionRow = new ActionRowBuilder().addComponents(event_recurring_field);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
	},
};