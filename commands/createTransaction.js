const { dbPassword } = require('../config.json');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { ThreadAutoArchiveDuration, AttachmentBuilder, channelMention, ButtonStyle, ButtonBuilder, TextInputBuilder, StringSelectMenuOptionBuilder, TextInputComponent, ContextMenuCommandBuilder, ApplicationCommandType, ActionRow, StringSelectMenuBuilder, IntegrationApplication, TextInputStyle, ActionRowBuilder, Attachment, EmbedBuilder, Embed, roleMention, ApplicationCommandPermissionType } = require('discord.js');
const { DateTime } = require('luxon');
const Sequelize = require('sequelize');
const Op = require('sequelize').Op
const sequelize = new Sequelize('foothill', 'manager', dbPassword, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data.sqlite',
});

const { Balance, MonthlyBudget, UserBalance, Transaction } = require('../dbObjects.js'); // Have to go through an association-filter.
const Category = require('../models/money/Category.js')(sequelize, Sequelize.DataTypes);
const Status = require('../models/money/Status.js')(sequelize, Sequelize.DataTypes);


module.exports = {
	data: new ContextMenuCommandBuilder()
        .setName('Send Money')
        .setType(ApplicationCommandType.Message),   
    
    async execute(interaction) {   
        await interaction.guild.channels.fetch();
        await interaction.guild.members.fetch();
        await interaction.channel.messages.fetch();

        
        const emoji_check_mark = await loadImage('./emoji-check_mark.png');
        const emoji_bookmark = await loadImage('./emoji-bookmark.png');
        const emoji_cross_mark = await loadImage('./emoji-cross_mark.png');

        // Create a new MonthlyBudget
        const monthlyBudget = await MonthlyBudget.findOne({ where: { threadId: interaction.channel.id }});
        const threadId = await interaction.channel.messages.cache.get(interaction.channel.id);
        const member = interaction.member;

        const single_user_balances = await monthlyBudget.getAUserBalances(member.id, monthlyBudget.id);
        // let balance_list = [];
        const balances = await monthlyBudget.getBalances();

        const option_list = [];
        const dataFromDatabase = await single_user_balances.map(preset => preset.get({ plain: true }));
        await dataFromDatabase.map(ub => {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(String(balances.find(b => b.id == ub.balanceId && b.name !== 'Loans/Debts').name))
                .setValue(String(ub.id))
                option_list.push(option)
        });
        option_list.push(
            new StringSelectMenuOptionBuilder()
                .setLabel('Cancel')
                .setValue(String(99999)))

        const select = new StringSelectMenuBuilder()
        .setCustomId('transactionType')
        .setPlaceholder('Make a selection!');
        select.options = option_list;

		const row = new ActionRowBuilder()
        .addComponents(select);

        const bob = await interaction.reply({content: 'Please select the category you\'d like to pay.', components: [row], ephemeral: true})
        
        const collectorFilter = i => i.user.id == interaction.user.id;
        const confirmation = await bob.awaitMessageComponent({ filter: collectorFilter, time: 60000 })

        const userBalanceId = parseInt(confirmation.values[0])

        try {
            if (userBalanceId == 99999) {
                
                const infoEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setAuthor({ name: 'How to log your paid bills:' })
                .setDescription('To get started, right-click any message in the thread and choose Apps>Send Money.\nThen you will select the Bill to pay. Then enter in the amount you paid.\n\n**LOGS**')
                .setTimestamp()
                .setFooter({ text: `Last Updated` });

                // Loop through transactions
                const transaction_list = await Transaction.findAll()
                const transactions = transaction_list.map(e => e.dataValues);
                
                const fields = [];
                await transactions.map(t => {
                    
                    if (t.monthlyBudgetId == monthlyBudget.id) {
                        text = { name: `${interaction.guild.members.cache.get(t.authorId).displayName} sent $${t.amount} for ${t.category}`, value: `${DateTime.fromISO(t.createdAt.toISOString()).setZone('America/Los_Angeles').toFormat("MMMM dd yyyy HH:mm")}` }
                        fields.push(text)
                    }
                })
                
                console.log(fields)

                fields.map(b => {
                    infoEmbed.addFields(b)

                })

                await interaction.channel.messages.fetch();
                await interaction.channel.messages.cache.get(monthlyBudget.messageId).edit({embeds: [infoEmbed]})
                await interaction.editReply({ content: 'Action cancelled', components: [] });
            } else if (userBalanceId > 0 && userBalanceId < 99999) {
                const userBalance = await UserBalance.findOne({ where: { id: userBalanceId }})
                const balance = await Balance.findOne({ where: { id: userBalance.balanceId }})
                const filter = m => m.member.id == member.id;

                await interaction.editReply({ content: `Please enter in the amount you want to pay for ${balance.name}.\nPlease input a number like 25, 430... etc.`, components: [] });
                const reply = await interaction.channel.awaitMessages({ filter, max: 1, time: 60_000, errors: ['time'] })

                if (reply) {
                    content = reply.first()
                    userBalance.amountPaid = userBalance.amountPaid -  parseInt(content);
                    const category = await Category.findOne({ where: { name: balance.name } })
                    const status = await Status.findOne({ where: { name: 'Approved' } })

                    
                    const transaction = await Transaction.create({ 
                        statusId: status.id,
                        categoryId: category.id,
                        userBalanceId: userBalance.id,
                        monthlyBudgetId: monthlyBudget.id,
                        amount: parseInt(content),
                        authorId: userBalance.userId,
                        recipientId: userBalance.userId,
                        category: category.name
                      });
                    userBalance.save()
                                        
                    const total_user_balances = await monthlyBudget.getAllBalances(monthlyBudget.id);

                    // Create a map to store amounts due for each category and user
                    const amountsDue = {
                        'Rent': {
                        '156978842848854016': 445,
                        '433061545287614474': 445,
                        '452239334393774081': 445,
                        '337728573571989506': 445,
                        '395248731257044992': 450
                        },
                        'Utilities/Gas': {
                        '156978842848854016': 157,
                        '433061545287614474': 151,
                        '452239334393774081': 137,
                        '337728573571989506': 137
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

                        // Fill the canvas with a white background
                        context.fillStyle = 'rgba(255,255,255)';
                        context.fillRect(0, 0, canvas.width, canvas.height);

                        // Load the background image
                        const background = await loadImage('./balances-Template.png');

                        // Draw the background image on the canvas
                        context.drawImage(background, 0, 0, canvas.width, canvas.height);

                        // Find the category names for which the quadrants should be populated
                        const categoryNames = Object.keys(amountsDue);  

                        const backgroundImageFields = [];
                        for (const categoryName of categoryNames) {
                            const categoryValues = amountsDue[categoryName];
                            for (const personId of Object.keys(categoryValues)) {
                                let quadrant;
                                if (categoryName === 'Rent') {
                                    quadrant = 'one';
                                } else if (categoryName === 'Utilities/Gas') {
                                    quadrant = 'two';
                                } else if (categoryName === 'Loans/Debts') {
                                    quadrant = 'three';
                                }
                                backgroundImageFields.push({ quadrant, fieldName: personId, headerName: categoryName });
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
                                    xOffset = 720;
                                    yOffset = 180 + (i * (lineHeight + lineSpacing)); // Update yOffset calculation
                                } else if (quadrant === 'two') {
                                    xOffset = 1515;  // Adjusted X-coordinate for quadrant 2
                                    yOffset = 280 + (i * (lineHeight + lineSpacing)) - 500; // Update yOffset calculation
                                } else if (quadrant === 'three') {
                                    xOffset = 720;  // Adjusted X-coordinate for quadrant 3
                                    yOffset = 680 + ((i % 4) * (lineHeight + lineSpacing)); // Update yOffset calculation
                                } else {
                                // Adjust these values for other quadrants as needed
                                    xOffset = 1500;  // Adjusted X-coordinate for quadrant 4
                                    yOffset = 680 + (i * (lineHeight + lineSpacing)); // Update yOffset calculation
                                }
                                maxCharsPerLine = 20;
                                maxLines = 3;
            
                                const dueValue = matchingBalance ? matchingBalance.balance.amountDue : 'N/A';
                                const paidValue = matchingBalance ? matchingBalance.balance.amountPaid : 'N/A';
                                                
                                // Draw the value on the canvas
                                const displayText = `$${paidValue}      $${dueValue}`;
                                
                                const lines = wrapText(displayText, maxCharsPerLine, maxLines);

                                let count = 0
                                lines.forEach(async (line, index) => {
                                    count++;
                                    const lineY = yOffset + (index * lineHeight);
                                    
                                    context.font = '30px Arial';
                                    context.fillStyle = '#000000';  // Set font color to black
                                    context.textAlign = "right";
                                    context.fillText(line, xOffset, lineY);                                    
                                    if (paidValue == 0.0) {
                                        const emoji = emoji_check_mark;
                                        context.drawImage(emoji, xOffset + 10, lineY - 25, 30, 30);
                                    } else if (paidValue < dueValue && paidValue != 0.0) {
                                        const emoji = emoji_bookmark;
                                        context.drawImage(emoji, xOffset + 10, lineY - 25, 30, 30);
                                    } else {
                                        const emoji = emoji_cross_mark;
                                        context.drawImage(emoji, xOffset + 10, lineY - 25, 30, 30);
                                    }
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
                    
                    const send_money_button = new ButtonBuilder()
                        .setCustomId('send_money')
                        .setLabel('Send')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji({ name: "🦴" });     
                    
                    const get_logs_button = new ButtonBuilder()
                        .setCustomId('budget_log')
                        .setLabel('Logs')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji({ name: "📝" });     
                    
                    const row = new ActionRowBuilder()
                    .addComponents(send_money_button, get_logs_button);  

                    await threadId.edit({files: [budget], components: [row]})
                    await interaction.channel.messages.cache.get(reply.first().id).delete();
                    
                    // Set up Info Embed                
                    const infoEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setAuthor({ name: 'LOGS' });

                    // Loop through transactions
                    const transaction_list = await Transaction.findAll()
                    const transactions = transaction_list.map(e => e.dataValues);
                    // console.log(transactions.length)
                    
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
                        { name: 'Back to Top', value: `[Back to Top](${threadId.url})` },
                    )

                    return await interaction.followUp({ content: `You sent ${parseInt(content)}.\n`, embeds: [infoEmbed], ephemeral: true });
                }
            }
        } catch (error) {
            return await interaction.followUp({ content: JSON.stringify(error), ephemeral: true })
        }   
	},
};