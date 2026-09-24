const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class InvoiceDetail extends Model { }

InvoiceDetail.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    menuProductId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'InvoiceDetail',
    tableName: 'invoice_details',
    timestamps: false
});

module.exports = InvoiceDetail;
