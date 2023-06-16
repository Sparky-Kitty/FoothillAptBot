const { dbPassword } = require('../config.json');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
// const {background_require} = require('');
const { getCurrentOffset, incrementOffset, decrementOffset } = require('./../tools/weekOffset.js');
// const { createCanvas } = require('canvas');
const { ModalBuilder, AttachmentBuilder, ButtonComponent, ButtonStyle, ButtonBuilder, TextInputBuilder, StringSelectMenuOptionBuilder, TextInputComponent, ContextMenuCommandBuilder, ApplicationCommandType, ActionRow, StringSelectMenuBuilder, IntegrationApplication, TextInputStyle, ActionRowBuilder, Attachment, EmbedBuilder, Embed, roleMention } = require('discord.js');
const { DateTime } = require('luxon');
const Sequelize = require('sequelize');
const Op = require('sequelize').Op
const sequelize = new Sequelize('foothill', 'manager', dbPassword, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data.sqlite',
});

const Event = require('../models/Event')(sequelize, Sequelize.DataTypes);  


module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName('Refresh Schedule')
        .setType(ApplicationCommandType.Message),   
    
    async execute(interaction) {     
        let message = new String;
        await interaction.guild.members.fetch();
        await interaction.guild.channels.fetch();

        const channel = await interaction.guild.channels.cache.get("1079492881817026591");
        await channel.messages.fetch();

        const existing_calendar = await channel.messages.cache.get("1112541782119555122");
        const existing_message = await channel.messages.cache.get("1112541783054880889");
        // console.log(existing_message.content)

        // Function to create the calendar view
        async function createCalendarView(event_list) {
            // Create a new canvas
            const canvas = createCanvas(1500, 900);
            const context = canvas.getContext('2d');
            // Set up calendar dimensions and styling
            const cellWidth = 200;
            const cellHeight = 80;
            const xOffset = 50;
            const yOffset = 60; // Adjust the yOffset value as needed
            const headerHeight = 60;
            const headerFont = '30px Arial';
            const eventFont = '14px Arial';
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          
            context.fillStyle = 'rgba(255,255,255)'; // Set the font color and transparency
            context.fillRect(0, 0, canvas.width, canvas.height);

            const background = await loadImage('./kawaii_cats-Background.png')
            context.drawImage(background, 0, 0, canvas.width, canvas.height);
          
            // Draw header
            context.fillStyle = '#000000';
            context.font = headerFont;
            context.fillText('Event Calendar', xOffset, yOffset);

            // Set background color
            // context.fillStyle = rgb(255,255,255);
            context.fillStyle = 'rgba(255,255,255, 0.45)'; // Set the font color and transparency
            context.fillRect(xOffset, yOffset - headerHeight, cellWidth * 7, (cellHeight * 8) + 80);

            // Draw day names
            context.fillStyle = '#000000';
            context.font = eventFont;
            for (let i = 0; i < dayNames.length; i++) {
                const dayIndex = i % 7; // Adjust the day index to start from Sunday
                const x = xOffset + i * cellWidth + 25;
                const y = yOffset + headerHeight;

                // Get the current date
                const currentDate = startOfWeek.plus({ days: dayIndex });

                // Format the day-of-the-month value
                const dayOfMonth = currentDate.day;
                const dayText = `${dayNames[dayIndex]} ${currentDate.month}/${dayOfMonth}`;
                context.fillText(dayText, x, y - 25);
            }

            // Draw lines between cells
            context.strokeStyle = 'gray'; // Set line color
            context.lineWidth = 1; // Set line width
            context.beginPath();
            for (let i = 0; i <= 6; i++) {
                const x = xOffset + i * cellWidth;
                context.moveTo(x, yOffset + headerHeight);
                context.lineTo(x, yOffset + headerHeight + 7 * cellHeight);
            }
            for (let i = 0; i <= 7; i++) {
                const y = yOffset + headerHeight + i * cellHeight;
                context.moveTo(xOffset, y);
                context.lineTo(xOffset + 8 * cellWidth, y);
            }
            context.stroke();
            
            // Set the height of each event row
            const eventRowHeight = 20;
            
            // Create an object to keep track of the number of events for each day
            const eventCount = {};
            for (let i = 0; i < 7; i++) {
                eventCount[i] = 0;
            }
        
            // Iterate through the events and populate the calendar
            event_list.forEach((event, index) => {
                const author = interaction.guild.members.cache.get(event.authorId);
                const startDate = new Date(event.start);
                const dayOfWeek = startDate.getDay();
                
                // Increment the event count for the current day
                eventCount[dayOfWeek]++;
                
                const x = xOffset + (dayOfWeek - 1) * cellWidth + cellWidth;
                const y = yOffset + headerHeight + (eventCount[dayOfWeek] - 1) * cellHeight;
                
            
                // Draw the event author in the cell
                let authorId = event.authorId;
                if (authorId == '1') {
                context.textBaseline = 'top';
                context.fillStyle = "#00000"; // Set the desired background color
                context.fillText("Group Event", x, y);
                } else {
                context.textBaseline = 'top';
                context.fillStyle = author.displayHexColor; // Set the desired background color
                context.fillText(author.displayName, x, y);
                }
            
                // Draw the event name in the cell
                context.textBaseline = 'top';
                const eventName = event.name.length > 10 ? event.name.substring(0, 20) + '...' : event.name;
                context.fillStyle = '#000000'; // Set the font color to black
                context.fillText(eventName, x, y + 20);
            
                // Draw the date in the cell
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
                const start_time = event.start.toLocaleTimeString('en-US', timeOptions);
                const end_time = event.end.toLocaleTimeString('en-US', timeOptions);
                context.textBaseline = 'bottom';
                context.fillStyle = '#000000'; // Set the font color to black
                context.fillText(`${start_time} to ${end_time}`, x, y + 50);
            
                // Draw the id in the cell
                context.textBaseline = 'bottom';
                context.fillStyle = '#000000'; // Set the font color to black
                const eventLocation = event.location.length > 10 ? event.location.substring(0, 20) : event.location;
                context.fillText(eventLocation, x, y + 70);
                // context.fillText("ID: " + event.id, x, y + 70);
            });
          
            // Draw footer
            context.fillStyle = '#000000';
            context.fillText(`This calendar is generated thanks to canvas and discord.js. It is designed to ease the communication around eachothers' schedules. If you have any suggestions, let Dennis know anytime.`, xOffset, yOffset + 800);
            
            return canvas;
        }

        function getStartOfWeek(date, weekDiff) {
            if (DateTime.fromJSDate(date).weekdayLong == 'Sunday') {
                const startOfWeek = DateTime.fromJSDate(date).plus({days: 1}).startOf('week').minus({ days: 1 }).plus({ weeks: weekDiff });
                return startOfWeek;
            } else {
                const startOfWeek = DateTime.fromJSDate(date).startOf('week').minus({ days: 1 }).plus({ weeks: weekDiff });
                return startOfWeek;
            }
        }
          
          function getEndOfWeek(date, weekDiff) {
            if (DateTime.fromJSDate(date).weekdayLong == 'Sunday') {
                const endOfWeek = DateTime.fromJSDate(date).plus({days: 1}).endOf('week').minus({ days: 1 }).plus({ weeks: weekDiff });
                return endOfWeek;
            } else {
                const endOfWeek = DateTime.fromJSDate(date).endOf('week').minus({ days: 1 }).plus({ weeks: weekDiff });
                return endOfWeek;
            }
        }
          
        const currentOffset = getCurrentOffset();
        console.log("Current offset: " + currentOffset);
        const currentDate = new Date();
        const startOfWeek = getStartOfWeek(currentDate, currentOffset);
        const endOfWeek = getEndOfWeek(currentDate, currentOffset);
        console.log("week range: " + startOfWeek.toISO() + ' - ' + endOfWeek.toISO());         
          
        const event_list = await Event.findAll({
            order: [['start', 'ASC']],
            where: {
                start: {
                    [Op.between]: [startOfWeek.toJSDate(), endOfWeek.toJSDate()],
                },
            },
        });

        const events = event_list.map(e => e.dataValues);

        // Check if event_list is empty
        if (events.length === 0) {
            await interaction.reply({ content: "There are no events for the selected week.", ephemeral: true });
            return;
        }

        // Create the calendar view using Canvas
        const calendarCanvas = await createCalendarView(events);
        
        // Convert the canvas to a buffer
        // const buffer = calendarCanvas.toBuffer('image/png');
        const finish = await calendarCanvas.encode('png')
        
	    const attachment = new AttachmentBuilder(finish, { name: 'kawaii_cats-Calendar-image.png' });

        // Add buttons
// dataUrl = canvas.
        

		const previous_week_button = new ButtonBuilder()
        .setCustomId('previous_week')
        .setLabel('Previous Week')
        .setStyle(ButtonStyle.Success)
        .setEmoji({ name: "👈" });     
		const current_week_button = new ButtonBuilder()
        .setCustomId('current_week')
        .setLabel('Current Week')
        .setStyle(ButtonStyle.Primary);        
		const next_week_button = new ButtonBuilder()
        .setCustomId('next_week')
        .setLabel('Next Week')
        .setStyle(ButtonStyle.Success)
        .setEmoji({ name: "👉" });     
        const refresh_calendar_button = new ButtonBuilder()
        .setCustomId('refresh_calendar')
        .setLabel('Refresh')
        .setStyle(ButtonStyle.Primary)
        .setEmoji({ name: "🔄" });     
        const add_event_button = new ButtonBuilder()
        .setCustomId('create_event')
        .setLabel('Create Event')
        .setStyle(ButtonStyle.Success)
        .setEmoji({ name: "➕" });     
        const remove_event_button = new ButtonBuilder()
        .setCustomId('remove_event')
        .setLabel('Remove Event')
        .setStyle(ButtonStyle.Danger)
        .setEmoji({ name: "➖" });     
        
        const row = new ActionRowBuilder()
        .addComponents(refresh_calendar_button, current_week_button);    
        const row2 = new ActionRowBuilder()
        .addComponents(previous_week_button, next_week_button);  
        const row3 = new ActionRowBuilder()
        .addComponents(add_event_button, remove_event_button);    
        
        

        await existing_calendar.edit({files: [attachment]})
        await existing_message.edit({content: `Last Updated: <t:${DateTime.now().toUnixInteger()}:R>`, components: [row, row2, row3]})
        
        await interaction.reply({content: "The calendar has been refreshed.", ephemeral: true})
	},
};