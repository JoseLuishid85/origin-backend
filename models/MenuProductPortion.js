const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class MenuProductPortion extends Model { }

MenuProductPortion.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    menuProductId: {
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
    }
}, {
    sequelize,
    modelName: 'MenuProductPortion',
    tableName: 'menu_product_portions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['menuProductId', 'portionId']
        }
    ]
});

module.exports = MenuProductPortion;
