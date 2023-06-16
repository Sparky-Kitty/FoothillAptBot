module.exports = (sequelize, DataTypes) => {
	return sequelize.define('macro', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		role: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		role2: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		message: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		timestamps: true,
	});
};