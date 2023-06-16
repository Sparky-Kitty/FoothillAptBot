const Sequelize = require('sequelize');

const sequelize = new Sequelize('foothill', 'manager', 'dndnerds', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'data.sqlite',
});


require('./models/Product.js')(sequelize, Sequelize.DataTypes);
require('./models/User.js')(sequelize, Sequelize.DataTypes);
const reminders = require('./models/Macro.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	const macros = [
	reminders.upsert({ name: 'Are Dishes Piling Up?', role: '1079305109785292840', message: 'Please wash/load the dishes :bowl_with_spoon:' }),
	reminders.upsert({ name: 'Unload Dishwasher Monday', role: '1079305298558328923', message: 'Please unload the dishwasher :fork_knife_plate:\nPlease remember to move the magnet and erase "Clean" and "Corbin" :magnet: **BEFORE** you close all the cupboard doors' }),
	reminders.upsert({ name: 'Unload Dishwasher Wednesday', role: '1079305178055983174', message: 'Please unload the dishwasher :fork_knife_plate:\nPlease remember to move the magnet and erase "Clean" and "Cory" :magnet:' }),
	reminders.upsert({ name: 'Unload Dishwasher Friday', role: '1079305219676061716', message: 'Please unload the dishwasher :fork_knife_plate:\nPlease remember to move the magnet and erase "Clean" and "Tristan" :magnet:' }),
	reminders.upsert({ name: 'Is The Dishwasher Drain Grody?', role: '1079305109785292840', message: 'Please clean the dishwasher :gloves:' }),
	reminders.upsert({ name: 'Is The Kitchen Trash Full?', role: '1079305298558328923', message: 'Please take out the trash :fly:\nDon\'t forget to replace bag :shopping_bags:' }),
	reminders.upsert({ name: 'Is The Recycling Bin Full?', role: '1079305219676061716', message: 'Please take out the recycling :recycle:' }),
	reminders.upsert({ name: 'Is The Recycling Bin Grody?', role: '1079305109785292840', message: 'Please clean the recycling bin :gloves::shower:' }),
	reminders.upsert({ name: 'Is The Green Bottle Bag Full?', role: '1079305109785292840', role2: '1079305178055983174', message: 'Please replace the BottleDrop bag :champagne:\n(Don\'t forget the sticker before putting bag in the can :label:)' }),
	reminders.upsert({ name: 'Is The BottleDrop Bin Grody?', role: '1079305109785292840', role2: '1079305178055983174', message: 'Please clean the BottleDrop bin :gloves::shower:' }),
	reminders.upsert({ name: 'Is The Stove Dirty?', role: '1079305178055983174', message: 'Please wipe down the stove :cooking:' }),
	reminders.upsert({ name: 'Is The Sink Dirty?', role: '1079305109785292840', message: 'Please wipe down the sink :champagne:\n(Best time is after loading dishes :bowl_with_spoon:)' }),
	reminders.upsert({ name: 'Is The Master Bathroom Dirty?', role: '1079305219676061716', role2: '1079305109785292840', message: 'Please clean the master bathroom :shower:' }),
	reminders.upsert({ name: 'Is The Main Bathroom Dirty?', role: '1079305338194509824', message: 'Please clean the main bathroom :bathtub: :shower:' }),
	reminders.upsert({ name: 'Is The Lil Litter Box Full?', role: '1079305109785292840', message: 'Please clean the small litter box :poop:' }),
	reminders.upsert({ name: 'Is The BIG Litter Box Full?', role: '1079305219676061716', message: 'Please clean the big litter box :poop:' }),
];

	await Promise.all(macros);
	console.log('Database synced');

	sequelize.close();
}).catch(console.error);