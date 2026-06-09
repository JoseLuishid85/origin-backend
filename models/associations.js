const Product = require('./Product');
const Department = require('./Department');
const ProductType = require('./ProductType');
const ProductUse = require('./ProductUse');
const Branch = require('./Branch');
const Deposit = require('./Deposit');

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

module.exports = {
    Product,
    Department,
    ProductType,
    ProductUse,
    Branch,
    Deposit
};