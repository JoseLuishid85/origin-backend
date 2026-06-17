const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Inventory extends Model { }

Inventory.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    depositId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    stockMin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    stockOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Inventory',
    tableName: 'inventories',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['productId', 'depositId']
        }
    ]
});

module.exports = Inventory;
