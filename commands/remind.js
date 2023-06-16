const { dbPassword } = require('./../config.json');
const { SlashCommandBuilder, roleMention, InteractionCollector } = require('discord.js');
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
        	.setName('remind')
            .setDescription('Sends a reminder.')
            .addSubcommand(subcommand => 
                subcommand.setName('preset')
                    .setDescription('Choose from preset reminders.')
                    .addStringOption((option) =>
                        option.setName("choice")
                        .setDescription("The input to echo back.")
                    )
                    .addChannelOption(option =>
                        option.setName('channel')
                        .setDescription('The channel to send the message to (default is #anonymous-reminders).')
                        .setRequired(false)))
            .addSubcommand(subcommand =>
                subcommand.setName('custom')
                    .setDescription('Send a customized reminder.')
                        .addStringOption(option =>
                            option.setName('input')
                            .setDescription('The message to send')
                            .setRequired(true))
                        .addRoleOption(option => 
                            option.setName('user')
                            .setDescription('The user to send the message to.')
                            .setRequired(false))
                        .addRoleOption(option => 
                            option.setName('user2')
                            .setDescription('The second user to send the message to.')
                            .setRequired(false))
                        .addChannelOption(option =>
                            option.setName('channel')
                            .setDescription('The channel to send the message to (default is #anonymous-reminders).')
                            .setRequired(false))),    
    
    async execute(interaction) {     
        let message = new String;
        const option = interaction.options.getSubcommand();
        const choice = interaction.options.getString('choice');
        let role, role2, channel, input;

        if (option == 'preset') {
            console.log("choice: " + choice)
            try {                
                result = await Macro.findOne({ where: { name: choice }, plain: true });
                if (!result) {
                    await interaction.reply({ content: 'A reminder macro with that name does not exist. Please check your spelling and capitlization.', ephemeral: true });
                    console.log("Something went wrong...")

                } else {
                    console.log("result: " + result)
                    sequelize.close();
                    // channel = interaction.options.getChannel('channel')?? interaction.guild.channels.cache.get('860682502213206046'); // Live
                    channel = interaction.options.getChannel('channel')?? interaction.guild.channels.cache.get('1111438503805468744'); // Testing
                    message += roleMention(result.role);
                    // if (!result.role2) {
        
                    // } else {
                    //     message += ' ' +  roleMention(result.role2);
                    // }
                    message += ' ' + result.message;
                    await channel.send({content: message });
                    await interaction.reply({ content: 'Your reminder was sent.', ephemeral: true });
                }
            } catch (error) {
                console.log(error)
            }
    
            // if (result) {
            // } else {

            // }
    

        } else if (option == 'custom') {
            role = interaction.options.getRole('user')?.id?? null;
            role2 = interaction.options.getRole('user2')?.id?? null;
            // channel = interaction.options.getChannel('channel')?? interaction.guild.channels.cache.get('860682502213206046'); // Live
            channel = interaction.options.getChannel('channel')?? interaction.guild.channels.cache.get('1111438503805468744'); // Testing
            input = interaction.options.getString('input');

            // bob = interaction.guild.roles.cache.get(role.toString())
    
            if (role) message += roleMention(role);
            if (role2) message += ' ' + roleMention(role2);
            message += ' ' + input
    
            await channel.send({content: message });
            await interaction.reply({ content: 'Your reminder was sent.', ephemeral: true });
        }
        
	},
};