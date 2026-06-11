const { Branch, Deposit } = require('../models/associations');

const createBranch = async (req, res) => {
    const { name, address, phone, email, city } = req.body;

    try {
        await Branch.sync();

        const branchExists = await Branch.findOne({ where: { name } });
        if (branchExists) {
            return res.status(400).json({
                msg: 'La sucursal ya está registrada',
            });
        }

        const newBranch = await Branch.create({ name, address, phone, email, city });

        res.status(201).json({
            msg: "Sucursal agregada con éxito",
            branch: newBranch
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al procesar datos"
        });
    }
};

const getBranches = async (req, res) => {
    try {
        const branches = await Branch.findAll({
            include: [{
                model: Deposit,
                as: 'deposits'
            }]
        });

        res.json(branches);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener las sucursales"
        });
    }
};

const getBranchById = async (req, res) => {
    const { id } = req.params;

    try {
        const branch = await Branch.findByPk(id, {
            include: [{
                model: Deposit,
                as: 'deposits'
            }]
        });

        if (!branch) {
            return res.status(404).json({
                msg: `No existe una sucursal con el id ${id}`
            });
        }

        res.json(branch);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener la sucursal"
        });
    }
};

const updateBranch = async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, email, city } = req.body;

    try {
        await Branch.update({
            name, address, phone, email, city
        }, {
            where: { id }
        });

        const updatedBranch = await Branch.findByPk(id);

        res.json({
            ok: true,
            branch: updatedBranch
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al procesar datos'
        });
    }
};

const changeStateBranch = async (req, res) => {
    const { id } = req.params;

    try {
        const branch = await Branch.findByPk(id);

        await Branch.update({
            state: !branch.state
        }, {
            where: { id }
        });

        const branchChanged = await Branch.findByPk(id);

        res.json({
            ok: true,
            branch: branchChanged
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al cambiar el estado de la sucursal'
        });
    }
};

const deleteBranch = async (req, res) => {
    const { id } = req.params;

    try {
        const branch = await Branch.findByPk(id);

        if (!branch) {
            return res.status(404).json({
                msg: `No existe una sucursal con el id ${id}`
            });
        }

        const depositExists = await Deposit.findOne({
            where: { branchId: id }
        });

        if (depositExists) {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede eliminar la sucursal porque tiene depósitos asociados'
            });
        }

        await branch.destroy();

        res.json({
            ok: true,
            msg: `Sucursal eliminada con éxito`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar la sucursal'
        });
    }
};

module.exports = {
    createBranch,
    getBranches,
    getBranchById,
    updateBranch,
    changeStateBranch,
    deleteBranch,
};
