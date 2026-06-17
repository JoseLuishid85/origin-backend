const Product = require('./Product');
const Department = require('./Department');
const ProductType = require('./ProductType');
const ProductUse = require('./ProductUse');
const Branch = require('./Branch');
const Deposit = require('./Deposit');
const Inventory = require('./Inventory');
const Transfer = require('./Transfer');
const TransferDetail = require('./TransferDetail');

// --- Relaciones de Uno a Muchos (1:N) ---

// Un departamento tiene muchos productos
Department.hasMany(Product, { foreignKey: 'departmentId', as: 'products' });
Product.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

// Un tipo de producto pertenece a muchos productos
ProductType.hasMany(Product, { foreignKey: 'productTypeId', as: 'products' });
Product.belongsTo(ProductType, { foreignKey: 'productTypeId', as: 'productType' });

// Un uso pertenece a muchos productos
ProductUse.hasMany(Product, { foreignKey: 'productUseId', as: 'products' });
Product.belongsTo(ProductUse, { foreignKey: 'productUseId', as: 'productUse' });

// Una sucursal tiene muchos depósitos
Branch.hasMany(Deposit, { foreignKey: 'branchId', as: 'deposits' });
Deposit.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Un producto tiene muchos registros de inventario
Product.hasMany(Inventory, { foreignKey: 'productId', as: 'inventories' });
Inventory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Una sucursal tiene muchos registros de inventario
Branch.hasMany(Inventory, { foreignKey: 'branchId', as: 'inventories' });
Inventory.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Un depósito tiene muchos registros de inventario
Deposit.hasMany(Inventory, { foreignKey: 'depositId', as: 'inventories' });
Inventory.belongsTo(Deposit, { foreignKey: 'depositId', as: 'deposit' });

// Una sucursal origen tiene muchos traslados
Branch.hasMany(Transfer, { foreignKey: 'branchIdOrigin', as: 'transfersOut' });
Transfer.belongsTo(Branch, { foreignKey: 'branchIdOrigin', as: 'branchOrigin' });

// Una sucursal destino tiene muchos traslados
Branch.hasMany(Transfer, { foreignKey: 'branchIdDest', as: 'transfersIn' });
Transfer.belongsTo(Branch, { foreignKey: 'branchIdDest', as: 'branchDest' });

// Un traslado tiene muchos detalles
Transfer.hasMany(TransferDetail, { foreignKey: 'transferId', as: 'details' });
TransferDetail.belongsTo(Transfer, { foreignKey: 'transferId', as: 'transfer' });

// Un producto tiene muchos detalles de traslado
Product.hasMany(TransferDetail, { foreignKey: 'productId', as: 'transferDetails' });
TransferDetail.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
    Product,
    Department,
    ProductType,
    ProductUse,
    Branch,
    Deposit,
    Inventory,
    Transfer,
    TransferDetail
};