const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Department extends Model { }

Department.init({
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
    modelName: 'Department',
    tableName: 'departments',
    timestamps: true,
});

module.exports = Department;