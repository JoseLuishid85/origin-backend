const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Invoice extends Model { }

Invoice.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mobileStandId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    totalUsd: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    totalBs: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
    },
    exchangeRate: {
        type: DataTypes.DECIMAL(14, 4), // Bs por dólar al momento de facturar
        allowNull: true
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    state: {
        type: DataTypes.BOOLEAN, // false = anulada
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    timestamps: true
});

module.exports = Invoice;
