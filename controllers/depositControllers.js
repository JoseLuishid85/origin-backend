const { Deposit, Branch } = require('../models/associations');

const createDeposit = async (req, res) => {
    const { name, branchId } = req.body;

    try {
        await Deposit.sync();

        const branchExists = await Branch.findByPk(branchId);
        if (!branchExists) {
            return res.status(400).json({
                msg: `No existe una sucursal con el id ${branchId}`
            });
        }

        // El primero que se cree para la sucursal será el principal
        const existingDeposit = await Deposit.findOne({ where: { branchId } });
        const isMain = !existingDeposit;

        const newDeposit = await Deposit.create({ name, branchId, main: isMain });

        res.status(201).json({
            msg: "Depósito agregado con éxito",
            deposit: newDeposit
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al procesar datos"
        });
    }
};

const getDeposits = async (req, res) => {
    try {
        const deposits = await Deposit.findAll({
            where: { state: true },
            include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }]
        });

        res.json(deposits);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener los depósitos"
        });
    }
};

const getDepositById = async (req, res) => {
    const { id } = req.params;

    try {
        const deposit = await Deposit.findByPk(id, {
            include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }]
        });

        if (!deposit) {
            return res.status(404).json({
                msg: `No existe un depósito con el id ${id}`
            });
        }

        res.json(deposit);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener el depósito"
        });
    }
};

const updateDeposit = async (req, res) => {
    const { id } = req.params;
    const { name, branchId } = req.body;

    try {
        if (branchId) {
            const branchExists = await Branch.findByPk(branchId);
            if (!branchExists) {
                return res.status(400).json({
                    ok: false,
                    msg: `No existe una sucursal con el id ${branchId}`
                });
            }
        }

        await Deposit.update({
            name, branchId
        }, {
            where: { id }
        });

        const updatedDeposit = await Deposit.findByPk(id);

        res.json({
            ok: true,
            deposit: updatedDeposit
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar datos'
        });
    }
};

const changeStateDeposit = async (req, res) => {
    const { id } = req.params;

    try {
        const deposit = await Deposit.findByPk(id);

        await Deposit.update({
            state: !deposit.state
        }, {
            where: { id }
        });

        const depositChanged = await Deposit.findByPk(id);

        res.json({
            ok: true,
            deposit: depositChanged
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al cambiar el estado del depósito'
        });
    }
};

const changeMainDeposit = async (req, res) => {
    const { id } = req.params;

    try {
        const deposit = await Deposit.findByPk(id);

        if (!deposit) {
            return res.status(404).json({
                msg: `No existe un depósito con el id ${id}`
            });
        }

        if (deposit.main) {
            return res.status(400).json({
                ok: false,
                msg: 'Este depósito ya es el principal de la sucursal'
            });
        }

        // Quitar principal a todos los depósitos de la misma sucursal
        await Deposit.update({ main: false }, { where: { branchId: deposit.branchId } });

        // Asignar principal al depósito seleccionado
        await Deposit.update({ main: true }, { where: { id } });

        const depositChanged = await Deposit.findByPk(id);

        res.json({
            ok: true,
            deposit: depositChanged
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al cambiar el depósito principal'
        });
    }
};

const deleteDeposit = async (req, res) => {
    const { id } = req.params;

    try {
        const deposit = await Deposit.findByPk(id);

        if (!deposit) {
            return res.status(404).json({
                msg: `No existe un depósito con el id ${id}`
            });
        }

        await deposit.destroy();

        res.json({
            ok: true,
            msg: `Depósito eliminado con éxito`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar el depósito'
        });
    }
};

module.exports = {
    createDeposit,
    getDeposits,
    getDepositById,
    updateDeposit,
    changeStateDeposit,
    changeMainDeposit,
    deleteDeposit,
};
