const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class BranchEquipment extends Model { }

BranchEquipment.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    equipmentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
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
    modelName: 'BranchEquipment',
    tableName: 'branch_equipments',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['equipmentId', 'branchId']
        }
    ]
});

module.exports = BranchEquipment;
