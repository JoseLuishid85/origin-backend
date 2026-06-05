const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ProductType extends Model { }

ProductType.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'ProductType',
    tableName: 'product_types',
    timestamps: true,
});

module.exports = ProductType;