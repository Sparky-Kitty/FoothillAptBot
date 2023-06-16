// Transaction model
module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      authorId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    }, {
      timestamps: true,
    });
    
    return Transaction;
  };