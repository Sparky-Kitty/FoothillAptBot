// Status model
module.exports = (sequelize, DataTypes) => {
    const Status = sequelize.define('Status', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      timestamps: false,
    });
  
    return Status;
  };