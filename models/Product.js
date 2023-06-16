module.exports = (sequelize, DataTypes) => {
	return sequelize.define('product', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};