const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class InvoicePayment extends Model { }

// Métodos cobrados en dólares; el resto se cobra en bolívares
InvoicePayment.USD_METHODS = ['EFECTIVO_USD', 'ZELLE'];
InvoicePayment.BS_METHODS = ['EFECTIVO_BS', 'PUNTO', 'PAGO_MOVIL', 'TRANSFERENCIA'];

InvoicePayment.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    method: {
        type: DataTypes.ENUM(...InvoicePayment.USD_METHODS, ...InvoicePayment.BS_METHODS),
        allowNull: false
    },
    amountUsd: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    amountBs: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
    },
    reference: {
        type: DataTypes.STRING(50), // N° de referencia / lote, opcional
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'InvoicePayment',
    tableName: 'invoice_payments',
    timestamps: false
});

module.exports = InvoicePayment;
