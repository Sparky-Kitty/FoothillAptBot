const { dbPassword } = require('./../config.json');
const { Balance, Category, MonthlyBudget, Status, Transaction, UserBalance } = require('./../dbObjects.js');
const { getCurrentOffset, incrementOffset, decrementOffset, resetOffset } = require('./../tools/weekOffset.js');
const { DateTime } = require('luxon');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { ModalBuilder, AttachmentBuilder, ButtonComponent, ButtonStyle, ButtonBuilder, TextInputBuilder, StringSelectMenuOptionBuilder, TextInputComponent, ContextMenuCommandBuilder, ApplicationCommandType, ActionRow, StringSelectMenuBuilder, IntegrationApplication, TextInputStyle, ActionRowBuilder, Attachment, EmbedBuilder, Embed } = require('discord.js');
const { DATE } = require("sequelize");
const Sequelize = require('sequelize');
const Op = require('sequelize').Op
const sequelize = new Sequelize('foothill', 'manager', dbPassword, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data.sqlite',
});
const Event = require("../models/Event")(sequelize, Sequelize.DataTypes);  

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
	
			if (!command) return;
	
			try {
				command.execute(interaction);
			}
			catch (error) {
				console.error(error);
				interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
			console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction with command: ${interaction.commandName}.`);
		} else if (interaction.isContextMenuCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
	
			if (!command) return;
	
			try {
				command.execute(interaction);
			}
			catch (error) {
				console.error(error);
				interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}

		} else if (interaction.isStringSelectMenu()) {
			// console.log("Selection Interaction: " + interaction.command.toString() + " was used by " + interaction.user.toString())
			
		} else if (interaction.isButton()) {			
			let canvas;
			
			if (interaction.customId == 'current_week') {
				resetOffset();
                const command = interaction.client.commands.get("Refresh Schedule");
                await command.execute(interaction)
			} else if (interaction.customId == 'budget_log') {
				const monthlyBudget = await MonthlyBudget.findOne({ where: { threadId: interaction.channel.id }});				
				await interaction.channel.messages.fetch();
				const threadId = await interaction.channel.messages.cache.get(interaction.channel.id);

				// Set up Info Embed                
				const infoEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setAuthor({ name: 'LOGS' });

				// Loop through transactions
				const transaction_list = await Transaction.findAll()
				const transactions = transaction_list.map(e => e.dataValues);
				
				const fields = [];
				await transactions.map(t => {
					
					if (t.monthlyBudgetId == monthlyBudget.id) {
						text = { name: `${interaction.guild.members.cache.get(t.authorId).displayName} sent $${t.amount} for ${t.category}`, value: `${DateTime.fromISO(t.createdAt.toISOString()).setZone('America/Los_Angeles').toFormat("MMMM dd yyyy HH:mm")}`, inline: true }
						fields.push(text)
					}
				})
				
				console.log(fields.length)

				fields.map(b => {
					infoEmbed.addFields(b)

				})

				infoEmbed.addFields(
					{ name: '\u200b', value: `[Back to Top](${threadId.url} 'Go to Budget')` },
				)

				return await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
			} else if (interaction.customId == 'send_money') {
                const command = interaction.client.commands.get("Send Money");
                await command.execute(interaction)
			} else if (interaction.customId == 'refresh_calendar') {
                const command = interaction.client.commands.get("Refresh Schedule");
                await command.execute(interaction)
			} else if (interaction.customId == 'create_event') {
                const command = interaction.client.commands.get("Event Create");
                await command.execute(interaction)
			} else if (interaction.customId == 'remove_event') {
                const command = interaction.client.commands.get("Event Remove");
                await command.execute(interaction)
			} else if (interaction.customId == 'previous_week') {		
				await interaction.guild.members.fetch();
				await interaction.guild.channels.fetch();
		
				const channel = await interaction.guild.channels.cache.get("1079492881817026591");
				await channel.messages.fetch();
		
				const existing_calendar = await channel.messages.cache.get("1112541782119555122");
				const existing_message = await channel.messages.cache.get("1112541783054880889");
				
				// Function to create the calendar view
				async function createCalendarView(event_list) {
					if (!canvas) {
					  canvas = createCanvas(1500, 900);
					}
					const context = canvas.getContext('2d');
					// Set up calendar dimensions and styling
					const cellWidth = 200;
					const cellHeight = 80;
					const xOffset = 50;
					const yOffset = 50; // Adjust the yOffset value as needed
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
					
					return canvas;
				}

				function calculateWeekRange(offset) {
					const currentDate = DateTime.now().plus({ weeks: offset });
					const startOfWeek = currentDate.startOf('week').minus({ days: 1 });
					const endOfWeek = currentDate.endOf('week').minus({ days: 1 });
					return { startOfWeek, endOfWeek };
				}

				decrementOffset();
				const currentOffset = getCurrentOffset();
        		console.log("Current offset: " + currentOffset);
				const { startOfWeek, endOfWeek } = calculateWeekRange(currentOffset);
				console.log("Week range: " + startOfWeek.toISO() + ' - ' + endOfWeek.toISO());
		
				// Use the startOfWeek and endOfWeek values in your event query
				const event_list = await Event.findAll({
					order: [['start', 'ASC']],
					where: {
						start: {
						[Op.between]: [startOfWeek.toJSDate(), endOfWeek.toJSDate()],
						},
					},
				});
				
				const calendarCanvas = await createCalendarView(event_list);
				
				// Convert the canvas to a buffer
				const finish = await calendarCanvas.encode('png')
				
				const attachment = new AttachmentBuilder(finish, { name: 'kawaii_cats-Calendar-image.png' });

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
				await interaction.reply({content: "The calendar has been refreshed.", ephemeral: true}).then(() =>
				setTimeout(() => interaction.deleteReply(),
						2_000 // not sure if you wanted 2000 (2s) or 20000 (20s)
					)
				)
			} else if (interaction.customId == 'next_week') {	
				await interaction.guild.members.fetch();
				await interaction.guild.channels.fetch();
		
				const channel = await interaction.guild.channels.cache.get("1079492881817026591");
				await channel.messages.fetch();
		
				const existing_calendar = await channel.messages.cache.get("1112541782119555122");
				const existing_message = await channel.messages.cache.get("1112541783054880889");
				
				// Function to create the calendar view
				async function createCalendarView(event_list) {
					if (!canvas) {
					  canvas = createCanvas(1500, 900);
					}
					const context = canvas.getContext('2d');
					// Set up calendar dimensions and styling
					const cellWidth = 200;
					const cellHeight = 80;
					const xOffset = 50;
					const yOffset = 50; // Adjust the yOffset value as needed
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
					
					return canvas;
				}
				
				function calculateWeekRange(offset) {
					const currentDate = DateTime.now().plus({ weeks: offset });
					const startOfWeek = currentDate.startOf('week').minus({ days: 1 });
					const endOfWeek = currentDate.endOf('week').minus({ days: 1 });
					return { startOfWeek, endOfWeek };
				}

				incrementOffset();
				const currentOffset = getCurrentOffset();
        		console.log("Current offset: " + currentOffset);
				const { startOfWeek, endOfWeek } = calculateWeekRange(currentOffset);
				console.log("Week range: " + startOfWeek.toISO() + ' - ' + endOfWeek.toISO());
	
				// Use the startOfWeek and endOfWeek values in your event query
				const event_list = await Event.findAll({
					order: [['start', 'ASC']],
					where: {
						start: {
						[Op.between]: [startOfWeek.toJSDate(), endOfWeek.toJSDate()],
						},
					},
				});
				
				const calendarCanvas = await createCalendarView(event_list);
				
				// Convert the canvas to a buffer
				const finish = await calendarCanvas.encode('png')
				
				const attachment = new AttachmentBuilder(finish, { name: 'kawaii_cats-Calendar-image.png' });
	
				// Add buttons
				
	
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
				await interaction.reply({content: "The calendar has been refreshed.", ephemeral: true}).then(() =>
					setTimeout(() => interaction.deleteReply(),
						2_000 // not sure if you wanted 2000 (2s) or 20000 (20s)
					)
				)
			}
			
		} else if(interaction.isModalSubmit()) {
			if (interaction.customId === 'eventCreationModal') {
				let event_name = interaction.fields.getTextInputValue('event_name');
				let group_event_boolean = false				

				let authorId = interaction.user.id;
				if (event_name.includes("Group: ")) {
					event_name = event_name.substring(event_name.indexOf(":") + 1)
					group_event_boolean = true
					authorId = "1"
				} else if (event_name.includes("7-11")) {
					authorId = "433061545287614474"
				} else if (event_name.includes("Tristan")) {
					authorId = "156978842848854016"
				} else if (event_name.includes("Corbin")) {
					authorId = "337728573571989506"
				} else if (event_name.includes("Cory")) {
					authorId = "452239334393774081"
				}

				const event_location = interaction.fields.getTextInputValue('event_location');

				// Parse the event start and end dates
				const startInput = interaction.fields.getTextInputValue('event_start');
				const endInput = interaction.fields.getTextInputValue('event_end');				
				// Convert input to Luxon DateTime objects
				const startDateTime = DateTime.fromFormat(startInput, 'MMMM-dd-yyyy HH:mm', { zone: 'America/Los_Angeles' }).setZone('utc', { keepLocalTime: true });
				if (!startDateTime.isValid) return await interaction.reply({ content: `Your inputted start date was the incorrect format.\n${startDateTime.invalidExplanation}.`, ephemeral: true });
				const endDateTime = DateTime.fromFormat(endInput, 'MMMM-dd-yyyy HH:mm', { zone: 'America/Los_Angeles' }).setZone('utc', { keepLocalTime: true });
				if (!endDateTime.isValid) return await interaction.reply({ content: `Your inputted end date was the incorrect format.\n${endDateTime.invalidExplanation}.`, ephemeral: true });
				// Convert to UTC DateTime objects
				const event_start = startDateTime.toUTC();
				const event_end = endDateTime.toUTC(); 

				let recurring_frequency = new String;
				let recurring_count = new String;

				if (interaction.fields.getTextInputValue('event_recurring')) {
					event_recurring = interaction.fields.getTextInputValue('event_recurring');
					const str = event_recurring;
					// str = "John Doe";
					strSplit = str.split(" ");
					recurring_frequency = strSplit[0]
					recurring_count = strSplit[1].substring(1)
					console.log(recurring_frequency)
					console.log(recurring_count)
				}
				if (!interaction.fields.getTextInputValue('event_recurring')) {
					// await interaction.reply({ content: `Your submission was received successfully!\n**Name: ** ${event_name}\n**Location: ** ${event_location}\n**Event Start: ** ${Date(event_start).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}\n**Event End: ** ${event_end.toLocaleString('en-US', { timeZone: 'America/Vancouver' })}`, ephemeral: true });
					const new_event = await Event.create({ name: event_name, location: event_location, start: event_start.toJSDate(), end: event_end.toJSDate(), authorId: authorId });
					if (new_event) {
						// await interaction.client.commands.fetch()
						const command = interaction.client.commands.get("Refresh Schedule");
						await command.execute(interaction)
						// await interaction.reply({ content: "Your event was created.", ephemeral: true})
					} else {
						await interaction.reply({ content: "Your event was NOT created.", ephemeral: true})
					}
				} else {
					const eventCreationPromises = [];

					if (recurring_frequency == "Daily") {
						let counter = 0;
						while (counter < recurring_count) {
							let new_start = event_start.plus({ days: counter });
							let new_end = event_end.plus({ days: counter });
							console.log("Creating event:", counter);
							let new_event = await Event.create({ name: event_name, location: event_location, start: new_start.toJSDate(), end: new_end.toJSDate(), authorId: authorId });
							console.log("Event created:", new_event);
							eventCreationPromises.push(new_event);
							// console.log(counter);
							counter++;
						}
					} else if (recurring_frequency == "Weekly") {
						let counter = 0;
						while (counter < recurring_count) {
							let new_start = event_start.plus({ weeks: counter });
							let new_end = event_end.plus({ weeks: counter });
							// console.log("Creating event:", counter);
							console.log("name: " + event_name + "\nlocation: " + event_location + "\nstart: " + new_start.toJSDate() + "\nend: " + new_end.toJSDate() + "\nauthorId: " + authorId)
							let new_event = await Event.create({ name: event_name, location: event_location, start: new_start.toJSDate(), end: new_end.toJSDate(), authorId: authorId});
							console.log("Event created:", new_event);
							console.log(counter);
							counter = counter + 1;
							eventCreationPromises.push(new_event);
						}
					} else if (recurring_frequency == "Monthly") {
						let counter = 0;
						while (counter < recurring_count) {
							let new_start = event_start.plus({ months: counter });
							let new_end = event_end.plus({ months: counter });
							console.log("Creating event:", counter);
							let new_event = await Event.create({ name: event_name, location: event_location, start: new_start.toJSDate(), end: new_end.toJSDate(), authorId: authorId });
							console.log("Event created:", new_event);
							eventCreationPromises.push(new_event);
							counter++;
						}
					}


					console.log("Number of promises:", eventCreationPromises.length);

					// Wait for all event creation promises to resolve
					try {
						// console.log("eventCreationPromises: " + eventCreationPromises);
						// await Promise.all(eventCreationPromises);
						// let eventCreationResults = [];
						for (let promise of eventCreationPromises) {
							try {
								let result = await promise;
								// eventCreationResults.push(result);
								// console.log("Event created:", result);
							} catch (error) {
								console.error("Error creating event:", error);
							}
						}

						// console.log("All events created:", eventCreationResults);
						try {
							await interaction.reply({ content: "Your event was created.\n", ephemeral: true });
							console.log("Reply sent successfully");
						  } catch (error) {
							console.error("Error sending reply:", error);
						  }
						  

						// console.log("After Promise.all");

						// await interaction.reply({ content: "Your event was created.\n", ephemeral: true });
					  } catch (error) {
						console.error("Error occurred during event creation:", error);
					  }
				}
			}
		}
	},
};