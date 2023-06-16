const { dbPassword } = require('../config.json');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { ThreadAutoArchiveDuration, AttachmentBuilder, channelMention, ButtonStyle, ButtonBuilder, TextInputBuilder, StringSelectMenuOptionBuilder, TextInputComponent, ContextMenuCommandBuilder, ApplicationCommandType, ActionRow, StringSelectMenuBuilder, IntegrationApplication, TextInputStyle, ActionRowBuilder, Attachment, EmbedBuilder, Embed, roleMention } = require('discord.js');
const { DateTime } = require('luxon');
const Sequelize = require('sequelize');
const Op = require('sequelize').Op
const sequelize = new Sequelize('foothill', 'manager', dbPassword, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data.sqlite',
});

const { Balance, MonthlyBudget, UserBalance } = require('../dbObjects.js'); // Have to go through an association-filter.
const Category = require('../models/money/Category.js')(sequelize, Sequelize.DataTypes);

module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName('Generate Budget')
        .setType(ApplicationCommandType.Message),   
    
    async execute(interaction) {    
        const dateObject = DateTime.now().setZone('America/Los_Angeles');
        const emoji_cross_mark = await loadImage('./emoji-cross_mark.png');
        const today = dateObject.day;
        const endOfMonth = dateObject.endOf('month');
        // if (interaction.user.id == "395248731257044992") {
        if (today >= endOfMonth.minus({ days: 1, hours: 23, minutes: 59}).day) {
            // Create a new MonthlyBudget
            const monthlyBudget = await MonthlyBudget.create({ month: new Date() });
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
    
            // Create a map to store amounts due for each category and user
            const amountsDue = {
                'Rent': {
                '156978842848854016': 445, // Tristan
                '433061545287614474': 445, // Potato
                '452239334393774081': 445, // Cory
                '337728573571989506': 445, // Corbin
                '395248731257044992': 450 // Dennis
                },
                'Utilities/Gas': {
                '156978842848854016': 202, // Tristan
                '433061545287614474': 196, // Potato
                '452239334393774081': 182, // Cory
                '337728573571989506': 182 // Corbin
                }
            };
                        
            function wrapText(text, maxCharsPerLine, maxLines) {
                const words = text.split(' ');
                const lines = [];
                let currentLine = '';
            
                for (let i = 0; i < words.length; i++) {
                    const word = words[i];
                    const potentialLine = currentLine + ' ' + word;
                
                    if (potentialLine.trim().length <= maxCharsPerLine) {
                        currentLine = potentialLine;
                    } else {
                        lines.push(currentLine.trim());
                        currentLine = word;
                    }
                
                    if (lines.length === maxLines - 1) {
                        break;
                    }
                }
            
                lines.push(currentLine.trim());
                return lines;
        }
    
            async function createBudgetView() {
    
                // Create a new canvas
                const canvas = createCanvas(1920, 1080);
                const context = canvas.getContext('2d');
    
                // Set up dimensions and styling
                const eventFont = '30px Arial';
    
                // Fill the canvas with a white background
                context.fillStyle = 'rgba(255,255,255)';
                context.fillRect(0, 0, canvas.width, canvas.height);
    
                // Load the background image
                const background = await loadImage('./balances-Template.png');
    
                // Draw the background image on the canvas
                context.drawImage(background, 0, 0, canvas.width, canvas.height);
    
                // Find the category names for which the quadrants should be populated
                const categoryNames = Object.keys(amountsDue);           
    
                for (let i = 0; i < categoryNames.length; i++) {
                    const catName = categoryNames[i];
                    const catValues = amountsDue[catName];
                    console.log("Category Values: " + catValues);
    
                    // Find the Category based on the name from userBalanceData
                    const category = await Category.findOne({ where: { name: catName } });
    
                    // Create a new Balance for the current category
                    const balance = await Balance.create({ name: category.name, categoryId: category.id, monthlyBudgetId: monthlyBudget.id });
                    monthlyBudget.addBalance(balance);
    
                    const people_ids = Object.keys(catValues);
                    console.log("people_ids: " + people_ids);
    
                    for (let j = 0; j < people_ids.length; j++) {
                        const amountDue = catValues[people_ids[j]];
                        const userBalance = await UserBalance.create({
                            userId: people_ids[j],
                            amountDue: amountDue,
                            amountPaid: amountDue,
                            balanceId: balance.id
                        });
                        await balance.addUserBalance(userBalance);
                    }
                }
    
                const backgroundImageFields = [];
                for (const categoryName of categoryNames) {
                    const categoryValues = amountsDue[categoryName];
                    for (const personId of Object.keys(categoryValues)) {
                        let quadrant;
                        if (categoryName === 'Rent') {
                            quadrant = 'one';
                        } else if (categoryName === 'Utilities/Gas') {
                            quadrant = 'two';
                        }
                        backgroundImageFields.push({ quadrant, fieldName: personId, headerName: categoryName });
                    }
                }
                
                
                let total_user_balances = [];
    
                const budget_balances = await monthlyBudget.getBalances()
                // console.log(budget_balances)
                let count = 0;
                for (const temp_budget_balance of budget_balances) {
                    const temp_user_balancessss = await temp_budget_balance.getUserBalances()
                    const temp_user_balances = temp_user_balancessss
                    count++;
                    if (count == 1) {
                        total_user_balances = temp_user_balances
                    } else {
                        temp_user_balances.forEach(b => {
                            total_user_balances.push(b)
                        })
                    }
                }
    
                const fetchBalances = total_user_balances.map(async b => {
                    const parent = await Balance.findOne({ where: { id: b.balanceId } });
                    return { balance: b, parent: parent };
                });
    
                
                let xOffset, yOffset, maxCharsPerLine, maxLines;
                const lineHeight = 30 + 10; // Adjust the line height as needed
                let lineSpacing = 40; // Adjust the line spacing as needed
                await Promise.all(fetchBalances).then(balances => {// Modify the loop as follows
                    // Loop through the backgroundImageFields array and populate the quadrants dynamically
                    for (let i = 0; i < backgroundImageFields.length; i++) {
                        const field = backgroundImageFields[i];
                        const { quadrant, fieldName, headerName } = field;
                        const matchingBalance = balances.find(b => {
                            const balance = b.balance;
                            return balance && b.parent.name === headerName && balance.userId === fieldName;
                        });    
                        
                        // Determine the quadrant-specific positioning
                        if (quadrant === 'one') {
                            xOffset = 575;
                            yOffset = 180 + (i * (lineHeight + lineSpacing)); // Update yOffset calculation
                        } else if (quadrant === 'two') {
                            xOffset = 1350;  // Adjusted X-coordinate for quadrant 2
                            yOffset = 280 + (i * (lineHeight + lineSpacing)) - 500; // Update yOffset calculation
                        } else if (quadrant === 'three') {
                            xOffset = 575;  // Adjusted X-coordinate for quadrant 3
                            yOffset = 680 + ((i % 4) * (lineHeight + lineSpacing)); // Update yOffset calculation
                        } else {
                        // Adjust these values for other quadrants as needed
                            xOffset = 1350;  // Adjusted X-coordinate for quadrant 4
                            yOffset = 680 + (i * (lineHeight + lineSpacing)); // Update yOffset calculation
                        }
                        maxCharsPerLine = 20;
                        maxLines = 3;
      
                        const dueValue = matchingBalance ? matchingBalance.balance.amountDue : 'N/A';
                        const paidValue = matchingBalance ? matchingBalance.balance.amountPaid : 'N/A';
                                        
                        // Draw the value on the canvas
                        const displayText = `$${paidValue}      $${dueValue}`;
                        console.log("displayText: " + displayText);
    
                        const lines = wrapText(displayText, maxCharsPerLine, maxLines);
    
                        let count = 0
                        lines.forEach((line, index) => {
                            count++;
                            const lineY = yOffset + (index * lineHeight);
                            
                            context.font = '30px Arial';
                            context.fillStyle = '#000000';  // Set font color to black
                            context.fillText(line, xOffset, lineY);
                            context.drawImage(emoji_cross_mark, xOffset - 30, lineY - 25, 30, 30);
    
                        });
    
                        yOffset += lines.length * lineHeight; // Adjust yOffset for the next value
                    }       
                }).catch(error => {
                    console.error('Error fetching balances:', error);
                });
                
                return canvas
            }  
            
            // Save the canvas as an image file (e.g., PNG)
            const budgetCanvas = await createBudgetView();
            
            // Convert the canvas to a buffer
            const budget = await budgetCanvas.encode('png')
            
            // Generate thread
            let channel;
            
            if (interaction.user.id == "395248731257044992") {
                channel = await interaction.guild.channels.cache.get("1111439190287204474"); // dev-money
            } else {            
                channel = await interaction.guild.channels.cache.get("1079445170568839218"); // money
            }            
                    
            const send_money_button = new ButtonBuilder()
                .setCustomId('send_money')
                .setLabel('Send')
                .setStyle(ButtonStyle.Primary)
                .setEmoji({ name: "🦴" });     
                    
            const get_logs_buttun = new ButtonBuilder()
                .setCustomId('budget_log')
                .setLabel('Logs')
                .setStyle(ButtonStyle.Primary)
                .setEmoji({ name: "📝" });     
            
            const row = new ActionRowBuilder()
                .addComponents(send_money_button, get_logs_buttun);     
    
            await channel.threads.create({
                name: `${monthNames[monthlyBudget.month.getMonth()]} Bills ${monthlyBudget.month.getFullYear()}`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                message: {
                    files: [budget],
                    components: [row]
                },
                reason: 'New Budget',
                appliedTags: [channel.availableTags.find(t => t.name == "Monthly Bills").id]
            }).then(async thread => {    
                const file = new AttachmentBuilder('./infographic.mp4');
                const mobile_file = new AttachmentBuilder('./infographic-mobile.mp4');                
    
                await thread.send({content: '`PC Guide                                                  Mobile Guide`', files: [file, mobile_file]}).then(async message => {
                    
                    monthlyBudget.threadId = thread.id;
                    monthlyBudget.messageId = message.id;
                    await monthlyBudget.save();
                })      
            })
            .catch(error => console.log(error))
            
            return await interaction.reply({content: `Your generated budget has been made. Please head to ${channelMention(monthlyBudget.threadId)}.`})
        } else {        
            return await interaction.reply({content: `You are too speedy. Please wait till the day before the month turns over.`})
        }
	},
};