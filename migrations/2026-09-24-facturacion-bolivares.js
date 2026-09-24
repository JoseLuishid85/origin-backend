// Migración: facturación en $ y Bs + porciones por línea de factura en su propia tabla.
// El proyecto usa sequelize.sync({ alter: false }), por eso estos cambios se aplican a mano.
// Uso (desde backend/):  node migrations/2026-09-24-facturacion-bolivares.js
// Es seguro ejecutarlo más de una vez: revisa qué columnas existen antes de cambiar algo.
require('dotenv').config({ quiet: true });
const sequelize = require('../config/database');

async function columns(table) {
    const [rows] = await sequelize.query(`SHOW COLUMNS FROM \`${table}\``);
    return rows.map(r => r.Field);
}

async function run() {
    // 1. invoices: total -> totalUsd, + totalBs, + exchangeRate
    let cols = await columns('invoices');
    if (cols.includes('total')) {
        await sequelize.query('ALTER TABLE invoices CHANGE COLUMN total totalUsd DECIMAL(10,2) NOT NULL DEFAULT 0');
        console.log('invoices: total renombrado a totalUsd');
    }
    cols = await columns('invoices');
    if (!cols.includes('totalBs')) {
        await sequelize.query('ALTER TABLE invoices ADD COLUMN totalBs DECIMAL(14,2) NOT NULL DEFAULT 0 AFTER totalUsd');
        console.log('invoices: agregado totalBs');
    }
    if (!cols.includes('exchangeRate')) {
        await sequelize.query('ALTER TABLE invoices ADD COLUMN exchangeRate DECIMAL(14,4) NULL AFTER totalBs');
        console.log('invoices: agregado exchangeRate');
    }

    // 2. invoice_payments: amount -> amountUsd / amountBs, nuevos métodos
    cols = await columns('invoice_payments');
    if (cols.includes('amount')) {
        await sequelize.query(`ALTER TABLE invoice_payments MODIFY COLUMN method
            ENUM('EFECTIVO','EFECTIVO_USD','ZELLE','EFECTIVO_BS','PUNTO','PAGO_MOVIL','TRANSFERENCIA') NOT NULL`);
        await sequelize.query(`ALTER TABLE invoice_payments
            ADD COLUMN amountUsd DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER method,
            ADD COLUMN amountBs DECIMAL(14,2) NOT NULL DEFAULT 0 AFTER amountUsd`);
        // Los pagos anteriores se registraron en $ y sin tasa: se conservan en amountUsd
        await sequelize.query('UPDATE invoice_payments SET amountUsd = amount');
        await sequelize.query("UPDATE invoice_payments SET method = 'EFECTIVO_USD' WHERE method = 'EFECTIVO'");
        await sequelize.query(`ALTER TABLE invoice_payments MODIFY COLUMN method
            ENUM('EFECTIVO_USD','ZELLE','EFECTIVO_BS','PUNTO','PAGO_MOVIL','TRANSFERENCIA') NOT NULL`);
        await sequelize.query('ALTER TABLE invoice_payments DROP COLUMN amount');
        console.log('invoice_payments: amount migrado a amountUsd/amountBs');
    }

    // 3. invoice_detail_portions: reemplaza la columna JSON invoice_details.portions
    await sequelize.query(`CREATE TABLE IF NOT EXISTS invoice_detail_portions (
        id INT(11) NOT NULL AUTO_INCREMENT,
        invoiceDetailId INT(11) NOT NULL,
        portionId INT(11) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        recipeQuantity DECIMAL(10,2) NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        KEY invoiceDetailId (invoiceDetailId),
        KEY portionId (portionId),
        CONSTRAINT invoice_detail_portions_ibfk_1 FOREIGN KEY (invoiceDetailId) REFERENCES invoice_details (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT invoice_detail_portions_ibfk_2 FOREIGN KEY (portionId) REFERENCES portions (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`);

    cols = await columns('invoice_details');
    if (cols.includes('portions')) {
        const [details] = await sequelize.query('SELECT id, portions FROM invoice_details WHERE portions IS NOT NULL');
        let migrated = 0;
        for (const d of details) {
            const portions = typeof d.portions === 'string' ? JSON.parse(d.portions) : d.portions;
            for (const p of portions || []) {
                await sequelize.query(
                    'INSERT INTO invoice_detail_portions (invoiceDetailId, portionId, quantity, recipeQuantity) VALUES (?, ?, ?, ?)',
                    { replacements: [d.id, p.portionId, p.quantity, p.quantity] }
                );
                migrated++;
            }
        }
        await sequelize.query('ALTER TABLE invoice_details DROP COLUMN portions');
        console.log(`invoice_details: ${migrated} porciones migradas a invoice_detail_portions`);
    }

    console.log('Migración completada.');
}

run()
    .catch(err => { console.error('Error en la migración:', err.message); process.exitCode = 1; })
    .finally(() => sequelize.close());
