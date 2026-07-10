const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Equipment extends Model { }

Equipment.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(100), // Computadora, Televisor, Maquina de Hacer Cajas, etc.
        allowNull: true
    },
    brand: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Equipment',
    tableName: 'equipments',
    timestamps: true,
});

module.exports = Equipment;
