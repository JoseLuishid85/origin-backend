const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class TransferDetail extends Model { }

TransferDetail.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    transferId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'TransferDetail',
    tableName: 'transfer_details',
    timestamps: false
});

module.exports = TransferDetail;
