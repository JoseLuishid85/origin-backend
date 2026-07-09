const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Product extends Model { }

Product.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    packageType: {
        type: DataTypes.STRING(50), // UND, FRASCO, LATA, PAQUETES, SOBRES
        allowNull: true
    },
    packageQuantity: {
        type: DataTypes.STRING(50), // 1, 1KG, 123, XXML, etc.
        allowNull: true
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
});

module.exports = Product;