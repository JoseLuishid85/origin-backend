const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class PortionSupplyDetail extends Model { }

PortionSupplyDetail.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    portionSupplyId: {
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
    modelName: 'PortionSupplyDetail',
    tableName: 'portion_supply_details',
    timestamps: false
});

module.exports = PortionSupplyDetail;
