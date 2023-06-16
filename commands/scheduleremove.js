const { dbPassword } = require('../config.json');
const { createCanvas } = require('@napi-rs/canvas');
const { getCurrentOffset, incrementOffset, decrementOffset } = require('./../tools/weekOffset.js');
// const { createCanvas } = require('canvas');
const { ModalBuilder, ButtonComponent, ButtonStyle, ButtonBuilder, TextInputBuilder, StringSelectMenuOptionBuilder, TextInputComponent, ContextMenuCommandBuilder, ApplicationCommandType, ActionRow, StringSelectMenuBuilder, IntegrationApplication, TextInputStyle, ActionRowBuilder, Attachment, EmbedBuilder, Embed } = require('discord.js');
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
        .setName('Event Remove')
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
        function drawRemoveEventCalendar(event_list) {
            // Create a new canvas
            const canvas = createCanvas(1500, 900);
            const context = canvas.getContext('2d');
            // Set up calendar dimensions and styling
            const cellWidth = 200;
            const cellHeight = 80;
            const xOffset = 50;
            const yOffset = 60; // Increased yOffset for additional line spacing
            const headerHeight = 60;
            // Set the height of each event row
            const eventRowHeight = 20;
            const headerFont = '30px Arial';
            const eventFont = '14px Arial';
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            // Calculate the total height of the calendar
            const totalHeight =
            yOffset + headerHeight + 6 * cellHeight + 2 * eventRowHeight;

            // Calculate the vertical offset to center the calendar
            const yOffsetCentered = (canvas.height - totalHeight) / 2;

            // Adjust the yOffset for vertical centering
            const yOffsetAdjusted = yOffset + yOffsetCentered;

            // Set background color
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);

          
            // Set background color
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
          
            // Draw header
            context.fillStyle = '#000000';
            context.font = headerFont;
            context.fillText('Event Calendar', xOffset, yOffsetAdjusted);

            // Draw day names
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
            for (let i = 0; i <= 7; i++) {
                const x = xOffset + i * cellWidth;
                context.moveTo(x, yOffset + headerHeight);
                context.lineTo(x, yOffset + headerHeight + 6 * cellHeight);
            }
            for (let i = 0; i <= 6; i++) {
                const y = yOffset + headerHeight + i * cellHeight;
                context.moveTo(xOffset, y);
                context.lineTo(xOffset + 7 * cellWidth, y);
            }
            context.stroke();
            
            const eventCount = {};            
            for (let i = 0; i < 7; i++) {
                eventCount[i] = 0;
            }

            // Calculate the spacing between cell rows
            const rowSpacing = eventRowHeight * 0.5;

            // Iterate through the events and populate the calendar
            event_list.forEach((event, index) => {
                // const author;
                const author = interaction.guild.members.cache.get(event.authorId);
                
                const startDate = new Date(event.start);
                const dayOfWeek = startDate.getDay();
                eventCount[dayOfWeek]++;
                const x = xOffset + (dayOfWeek - 1) * cellWidth + cellWidth;
                const y = yOffset + headerHeight + (eventCount[dayOfWeek] - 1) * cellHeight;
              
                // Increment the event count for the current day
                console.log(eventCount)

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
                
                // Draw the event ID as an overlay
                const eventId = event.id.toString();
                const fontSize = cellHeight * 0.3; // Adjust the font size based on cell height
                context.font = `bold ${fontSize}px Arial`;
                context.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Set the font color and transparency
                context.textAlign = 'right'; // Align the text to the right
                context.textBaseline = 'top';
                
                // Calculate the position for the event ID overlay
                const textX = x + cellWidth - 5; // Adjusted to the right by 5 pixels
                const textY = y + cellHeight * 0.1; // Adjusted to the top by 10% of the cell height
                
                // Draw the event ID
                context.fillText(eventId, textX, textY);
                
                // Reset the font properties for the event name, date, and location
                context.font = eventFont;
                context.fillStyle = '#000000'; // Set the font color to black
                context.textAlign = 'left';
                

                // Draw the event name in the cell
                const eventName = event.name.length > 10 ? event.name.substring(0, 20) + '...' : event.name;
                const nameY = y + 20;
                context.fillText(eventName, x, nameY);

                // Draw the date in the cell
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
                const start_time = event.start.toLocaleTimeString('en-US', timeOptions);
                const end_time = event.end.toLocaleTimeString('en-US', timeOptions);
                const dateY = nameY + context.measureText(eventName).actualBoundingBoxDescent + 10;
                context.fillText(`${start_time} to ${end_time}`, x, dateY);

                // Draw the event location in the cell
                const eventLocation =
                event.location.length > 10 ? event.location.substring(0, 20) : event.location;
                const locationY = dateY + context.measureText(`${start_time} to ${end_time}`).actualBoundingBoxDescent + 10;
                context.fillText(eventLocation, x, locationY);

            });
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
        console.log("Current offset: " + currentOffset)
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
        const calendarCanvas = drawRemoveEventCalendar(events);
        
        // Convert the canvas to a buffer
        const buffer = calendarCanvas.toBuffer('image/png');

        // Transform data for Discord Options
        const options = await events.map(row => (
            new StringSelectMenuOptionBuilder()
                .setLabel(row.id.toString())
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

        const input = await interaction.reply({content: 'Please select an event to delete, by ID.\nRefer to the image below.', components: [row], files: [buffer], ephemeral: true})
            
        const collectorFilter = i => i.user.id == interaction.user.id;
        const confirmation = await input.awaitMessageComponent({ filter: collectorFilter, time: 60000 })

        const eventId = parseInt(confirmation.values[0])
        console.log("Event ID: " + eventId)
        const max = await Event.max('id'); 
        console.log("max: " + max)
        
        try {
            if (eventId == 99999) {
                await confirmation.update({ content: 'Action cancelled', components: [] });
            // } else if (macroId == 8888) { // For if I eventually add a "Custom Message"
            } else if (eventId > 0 && eventId <= max) {
                const event = await Event.findOne({ where: { id: eventId } })
                console.log("Fetched Event to be deleted: \n" + JSON.stringify(event))
                await event.destroy();
                
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
                const calendarCanvas = drawRemoveEventCalendar(events);
                
                // Convert the canvas to a buffer
                const buffer = calendarCanvas.toBuffer('image/png');
                

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
                
				await existing_calendar.edit({files: [buffer]})
				await existing_message.edit({content: `Last Updated: <t:${DateTime.now().toUnixInteger()}:R>`, components: [row, row2, row3]})
                
                await confirmation.update({ content: 'The event has been removed.', files: [], components: [] })                
            }
        } catch (error) {
            await interaction.followUp({ content: error.toString(), ephemeral: true })
            await confirmation.update({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }  
	},
};