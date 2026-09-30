// Migración: estado de cocina de los pedidos (pantalla de cocina en tiempo real).
// El proyecto usa sequelize.sync({ alter: false }), por eso estos cambios se aplican a mano.
// Uso (desde backend/):  node migrations/2026-09-30-pantalla-cocina.js
// Es seguro ejecutarlo más de una vez: revisa qué columnas existen antes de cambiar algo.
require('dotenv').config({ quiet: true });
const sequelize = require('../config/database');

async function columns(table) {
    const [rows] = await sequelize.query(`SHOW COLUMNS FROM \`${table}\``);
    return rows.map(r => r.Field);
}

async function run() {
    const cols = await columns('invoices');

    if (!cols.includes('kitchenStatus')) {
        await sequelize.query(`ALTER TABLE invoices
            ADD COLUMN kitchenStatus ENUM('PENDIENTE','ENTREGADO') NOT NULL DEFAULT 'PENDIENTE' AFTER observations`);
        // Las facturas anteriores ya fueron atendidas: no deben aparecer en la pantalla
        await sequelize.query("UPDATE invoices SET kitchenStatus = 'ENTREGADO'");
        console.log('invoices: agregado kitchenStatus (facturas existentes marcadas como ENTREGADO)');
    }

    if (!cols.includes('deliveredAt')) {
        await sequelize.query('ALTER TABLE invoices ADD COLUMN deliveredAt DATETIME NULL AFTER kitchenStatus');
        console.log('invoices: agregado deliveredAt');
    }

    console.log('Migración completada.');
}

run()
    .catch(err => { console.error('Error en la migración:', err.message); process.exitCode = 1; })
    .finally(() => sequelize.close());
