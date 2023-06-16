const Sequelize = require('sequelize');
const { dbPassword } = require('./config.json');
const sequelize = new Sequelize('foothill', 'manager', dbPassword, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'data.sqlite',
});

const Balance = require('./models/money/Balance.js')(sequelize, Sequelize.DataTypes);
const Category = require('./models/money/Category.js')(sequelize, Sequelize.DataTypes);
const MonthlyBudget = require('./models/money/MonthlyBudget.js')(sequelize, Sequelize.DataTypes);
const Status = require('./models/money/Status.js')(sequelize, Sequelize.DataTypes);
const Transaction = require('./models/money/Transaction.js')(sequelize, Sequelize.DataTypes);
const UserBalance = require('./models/money/UserBalance.js')(sequelize, Sequelize.DataTypes);

Balance.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Balance.belongsTo(MonthlyBudget, { foreignKey: 'monthlyBudgetId', onDelete: 'CASCADE' });
Balance.hasMany(UserBalance, { as: 'userBalances', foreignKey: 'balanceId', onDelete: 'CASCADE' });
MonthlyBudget.hasMany(Balance, { as: 'balances', foreignKey: 'monthlyBudgetId', onDelete: 'CASCADE' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Transaction.belongsTo(UserBalance, { foreignKey: 'userBalanceId', onDelete: 'CASCADE' });
Transaction.belongsTo(Status, { foreignKey: 'statusId', onDelete: 'CASCADE' });
Transaction.belongsTo(MonthlyBudget, { foreignKey: 'monthlyBudgetId', onDelete: 'CASCADE' });
UserBalance.belongsTo(Balance, { foreignKey: 'balanceId', onDelete: 'CASCADE' });


// Reflect.defineProperty(Users.prototype, 'addItem', {
// 	value: async item => {
// 		const userItem = await UserItems.findOne({
// 			where: { user_id: this.user_id, item_id: item.id },
// 		});

// 		if (userItem) {
// 			userItem.amount += 1;
// 			return userItem.save();
// 		}

// 		return UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
// 	},
// });

// // Reflect.defineProperty(Users.prototype, 'addItem', {
// // 	value: async item => {
// // 		const userItem = await UserItems.findOne({
// // 			where: { user_id: this.user_id, item_id: item.id },
// // 		});

// // 		if (userItem) {
// // 			userItem.amount += 1;
// // 			return userItem.save();
// // 		}

// // 		return UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
// // 	},ff
// // });

Reflect.defineProperty(MonthlyBudget.prototype, 'getAllBalances', {
	value: async budgetId => {
		const monthlyBudget = await MonthlyBudget.findOne({
			where: { id: budgetId },
		});	
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
		return total_user_balances
// // 		return UserItems.findAll({
// // 			where: { user_id: this.user_id },
// // 			include: ['item'],
// // 		});
	},
});

Reflect.defineProperty(MonthlyBudget.prototype, 'getAUserBalances', {
	value: async (userId, budgetId) => {
		// super
		const monthlyBudget = await MonthlyBudget.findOne({
			where: { id: budgetId },
		});		
		let single_user_balances = [];
		const budget_balances = await monthlyBudget.getBalances()
		let count = 0;
		for (const temp_budget_balance of budget_balances) {
			const temp_user_balancessss = await temp_budget_balance.getUserBalances({ where: { userId: userId } })
			const temp_user_balances = temp_user_balancessss
			count++;
			if (count == 1) {
				single_user_balances = temp_user_balances
			} else {
				temp_user_balances.forEach(b => {
					single_user_balances.push(b)
				})
			}
		} 
		return single_user_balances
	},
});

module.exports = { Balance, Category, MonthlyBudget, Status, Transaction, UserBalance };

