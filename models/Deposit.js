const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Deposit extends Model { }

Deposit.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    main: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Deposit',
    tableName: 'deposits',
    timestamps: true,
});

module.exports = Deposit;
