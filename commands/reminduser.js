const { dbPassword } = require('../config.json');
const { SlashCommandBuilder, roleMention, InteractionCollector, StringSelectMenuOptionBuilder, ContextMenuCommandBuilder, ApplicationCommandType, ActionRowBuilder, StringSelectMenuBuilder, IntegrationApplication } = require('discord.js');
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
	.setName('Remind User')
	.setType(ApplicationCommandType.User),   
    
    async execute(interaction) {     
        let message = new String;
        await interaction.guild.members.fetch();
        await interaction.guild.channels.fetch();

        const { displayName } = interaction.targetMember;
        let role
        await interaction.guild.roles.fetch().then(fetched => fetched.map(r => {
            if (r.name == displayName) {
                role = r
            } 
        }));

        // Get macros that match
        const presets = await Macro.findAll({where: {            
            [Op.or]: [ 
                { 
                    role: {
                        [Op.eq]: role.id
                    },
                },
                { 
                    role2: {
                        [Op.eq]: role.id
                    },
                },
            ]
        }});
        
        // Transform data for Discord Options
        const dataFromDatabase = await presets.map(preset => preset.get({ plain: true }));
        const options = await dataFromDatabase.map(row => (
            new StringSelectMenuOptionBuilder()
                .setLabel(row.name)
                .setValue(row.id.toString())            
        ));
        options.push(
            new StringSelectMenuOptionBuilder()
                .setLabel('Cancel')
                .setValue(String(99999)))
        const select = new StringSelectMenuBuilder()
        .setCustomId('macro')
        .setPlaceholder('Make a selection!');
        select.options = options;

		const row = new ActionRowBuilder()
        .addComponents(select);

        const input = await interaction.reply({
            content: "Select a reminder.", components: [row], ephemeral: true
        });        
        
        const collectorFilter = i => i.user.id == interaction.user.id;
        const confirmation = await input.awaitMessageComponent({ filter: collectorFilter, time: 60000 })

        const macroId = parseInt(confirmation.values[0])
        const max = await Macro.max();
        
        try {
            if (macroId == 99999) {
                await interaction.editReply({ content: 'Action cancelled', components: [] });
            // } else if (macroId == 8888) { // For if I eventually add a "Custom Message"
            } else if (macroId > 0 && macroId < max) {
                const reminder = await Macro.findOne({ where: { id: macroId } })

                message += roleMention(reminder.role);
                if (!reminder.role2) {
    
                } else {
                    message += ' ' +  roleMention(reminder.role2);
                }
                message += ' ' + reminder.message;

                await interaction.guild.channels.cache.get("860682502213206046").send({content: message });
                await confirmation.update({ content: 'Your reminder was sent.', components: [] });
            }
        } catch (error) {
            await interaction.followUp({ content: error.toString(), ephemeral: true })
            await confirmation.update({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }        
	},
};