const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Portion extends Model { }

Portion.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    unitType: {
        type: DataTypes.STRING(50), // Unidad, Rodaja, Gramo, etc.
        allowNull: true
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Portion',
    tableName: 'portions',
    timestamps: true,
});

module.exports = Portion;
