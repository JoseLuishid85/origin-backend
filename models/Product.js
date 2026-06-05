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