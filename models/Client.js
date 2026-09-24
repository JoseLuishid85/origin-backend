const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Client extends Model { }

Client.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nationality: {
        type: DataTypes.ENUM('V', 'E', 'J', 'G'),
        allowNull: false
    },
    document: {
        type: DataTypes.STRING(20), // Cédula o RIF, ej: 1234567-9
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(150), // Nombre o razón social
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Client',
    tableName: 'clients',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['nationality', 'document']
        }
    ]
});

module.exports = Client;
