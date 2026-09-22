const Product = require('./Product');
const Department = require('./Department');
const ProductType = require('./ProductType');
const ProductUse = require('./ProductUse');
const Branch = require('./Branch');
const Deposit = require('./Deposit');
const Inventory = require('./Inventory');
const Transfer = require('./Transfer');
const TransferDetail = require('./TransferDetail');
const Equipment = require('./Equipment');
const BranchEquipment = require('./BranchEquipment');
const MobileStand = require('./MobileStand');
const Portion = require('./Portion');
const MenuProduct = require('./MenuProduct');
const MenuProductPortion = require('./MenuProductPortion');
const MobileStandPortion = require('./MobileStandPortion');
const PortionSupply = require('./PortionSupply');
const PortionSupplyDetail = require('./PortionSupplyDetail');

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

// Un equipo tiene muchos detalles de traslado
Equipment.hasMany(TransferDetail, { foreignKey: 'equipmentId', as: 'transferDetails' });
TransferDetail.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });

// Una sucursal tiene su propio inventario de equipos
Branch.hasMany(BranchEquipment, { foreignKey: 'branchId', as: 'equipmentStocks' });
BranchEquipment.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Un equipo tiene muchos registros de inventario por sucursal
Equipment.hasMany(BranchEquipment, { foreignKey: 'equipmentId', as: 'branchStocks' });
BranchEquipment.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });

// --- Stand Móvil: menú, porciones y abastecimiento ---

// Un producto del menú tiene muchos ítems de receta
MenuProduct.hasMany(MenuProductPortion, { foreignKey: 'menuProductId', as: 'recipeItems' });
MenuProductPortion.belongsTo(MenuProduct, { foreignKey: 'menuProductId', as: 'menuProduct' });

// Una porción participa en muchas recetas de productos del menú
Portion.hasMany(MenuProductPortion, { foreignKey: 'portionId', as: 'menuProductLinks' });
MenuProductPortion.belongsTo(Portion, { foreignKey: 'portionId', as: 'portion' });

// Un stand móvil tiene su propio inventario de porciones
MobileStand.hasMany(MobileStandPortion, { foreignKey: 'mobileStandId', as: 'portionStocks' });
MobileStandPortion.belongsTo(MobileStand, { foreignKey: 'mobileStandId', as: 'mobileStand' });

// Una porción tiene muchos registros de inventario por stand
Portion.hasMany(MobileStandPortion, { foreignKey: 'portionId', as: 'standStocks' });
MobileStandPortion.belongsTo(Portion, { foreignKey: 'portionId', as: 'portion' });

// Un stand móvil tiene muchos abastecimientos de porciones
MobileStand.hasMany(PortionSupply, { foreignKey: 'mobileStandId', as: 'portionSupplies' });
PortionSupply.belongsTo(MobileStand, { foreignKey: 'mobileStandId', as: 'mobileStand' });

// Un abastecimiento tiene muchos detalles
PortionSupply.hasMany(PortionSupplyDetail, { foreignKey: 'portionSupplyId', as: 'details' });
PortionSupplyDetail.belongsTo(PortionSupply, { foreignKey: 'portionSupplyId', as: 'portionSupply' });

// Una porción tiene muchos detalles de abastecimiento
Portion.hasMany(PortionSupplyDetail, { foreignKey: 'portionId', as: 'supplyDetails' });
PortionSupplyDetail.belongsTo(Portion, { foreignKey: 'portionId', as: 'portion' });

module.exports = {
    Product,
    Department,
    ProductType,
    ProductUse,
    Branch,
    Deposit,
    Inventory,
    Transfer,
    TransferDetail,
    Equipment,
    BranchEquipment,
    MobileStand,
    Portion,
    MenuProduct,
    MenuProductPortion,
    MobileStandPortion,
    PortionSupply,
    PortionSupplyDetail
};