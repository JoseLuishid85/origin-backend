const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class InvoiceDetailPortion extends Model { }

// Porciones descontadas del stand por una línea de factura.
// quantity = lo realmente descontado; recipeQuantity = lo que indica la receta.
// quantity > recipeQuantity => porción adicional; quantity = 0 => porción quitada.
InvoiceDetailPortion.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoiceDetailId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    portionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    recipeQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'InvoiceDetailPortion',
    tableName: 'invoice_detail_portions',
    timestamps: false
});

module.exports = InvoiceDetailPortion;
