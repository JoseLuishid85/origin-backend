const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class MobileStandPortion extends Model { }

MobileStandPortion.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    portionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mobileStandId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    stockMin: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    stockOrder: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'MobileStandPortion',
    tableName: 'mobile_stand_portions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['portionId', 'mobileStandId']
        }
    ]
});

module.exports = MobileStandPortion;
