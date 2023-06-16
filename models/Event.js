module.exports = (sequelize, DataTypes) => {
	return sequelize.define('event', {
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		location: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		start: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		end: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		authorId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		recurring: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		recurring_frequency: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	}, {
		timestamps: true,
	});
};