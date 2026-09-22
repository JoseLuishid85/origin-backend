const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class MenuProduct extends Model { }

MenuProduct.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
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
    modelName: 'MenuProduct',
    tableName: 'menu_products',
    timestamps: true,
});

module.exports = MenuProduct;
