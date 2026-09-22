const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class MobileStand extends Model { }

MobileStand.init({
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
    location: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'MobileStand',
    tableName: 'mobile_stands',
    timestamps: true,
});

module.exports = MobileStand;
