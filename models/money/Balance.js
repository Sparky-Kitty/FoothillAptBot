// Balance model
module.exports = (sequelize, DataTypes) => {
    const Balance = sequelize.define('Balance', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      timestamps: false,
    });
    
    return Balance;
  };