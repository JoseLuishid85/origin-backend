const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ProductUse extends Model { }

ProductUse.init({
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
    modelName: 'ProductUse',
    tableName: 'product_uses',
    timestamps: true,
});

module.exports = ProductUse;