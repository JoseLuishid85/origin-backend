const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Transfer extends Model { }

Transfer.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    branchIdOrigin: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    branchIdDest: {
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
    modelName: 'Transfer',
    tableName: 'transfers',
    timestamps: true
});

module.exports = Transfer;
