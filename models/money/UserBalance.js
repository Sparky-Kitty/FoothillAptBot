// UserBalance model
module.exports = (sequelize, DataTypes) => {
    const UserBalance = sequelize.define('UserBalance', {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amountDue: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      amountPaid: {
        type: DataTypes.FLOAT,
        allowNull: false,
        default: 0
      },
    }, {
      timestamps: true,
    });
    
    return UserBalance;
  };