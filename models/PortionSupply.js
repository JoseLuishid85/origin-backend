const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class PortionSupply extends Model { }

PortionSupply.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mobileStandId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'PortionSupply',
    tableName: 'portion_supplies',
    timestamps: true
});

module.exports = PortionSupply;
