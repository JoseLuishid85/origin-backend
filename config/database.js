const { Sequelize } = require('sequelize');
require('dotenv').config({ quiet: true });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Evita que muestre logs en consola
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos exitosa.');
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
}

testConnection();

module.exports = sequelize;