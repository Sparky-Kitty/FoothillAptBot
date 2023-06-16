// MonthlyBudget model
module.exports = (sequelize, DataTypes) => {
    const MonthlyBudget = sequelize.define('MonthlyBudget', {
      month: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: 'monthly_budget_per_month',
      },
      threadId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      messageId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    }, {
      timestamps: false,
    });
    
    return MonthlyBudget;
  };