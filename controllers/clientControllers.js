const { Client } = require('../models/associations');
const { Op } = require('sequelize');

const NATIONALITIES = ['V', 'E', 'J', 'G'];
const DOCUMENT_REGEX = /^\d{5,10}(-\d)?$/;

// Normaliza y valida los datos de un cliente. Devuelve { data } o { error }.
const normalizeClient = ({ nationality, document, name, phone }) => {
    const data = {
        nationality: String(nationality || '').trim().toUpperCase(),
        document: String(document || '').trim(),
        name: String(name || '').trim(),
        phone: phone ? String(phone).trim() : null
    };

    if (!NATIONALITIES.includes(data.nationality)) {
        return { error: 'La nacionalidad debe ser V, E, J o G' };
    }
    if (!DOCUMENT_REGEX.test(data.document)) {
        return { error: 'La cédula o RIF no es válido (ej: 12345678 o 12345678-9)' };
    }
    if (!data.name) {
        return { error: 'El nombre o razón social es obligatorio' };
    }

    return { data };
};

const createClient = async (req, res) => {
    const { data, error } = normalizeClient(req.body);
    if (error) {
        return res.status(400).json({ msg: error });
    }

    try {
        const clientExists = await Client.findOne({
            where: { nationality: data.nationality, document: data.document }
        });
        if (clientExists) {
            return res.status(400).json({ msg: `Ya existe un cliente con el documento ${data.nationality}-${data.document}` });
        }

        const newClient = await Client.create(data);

        res.status(201).json({
            msg: "Cliente registrado con éxito",
            client: newClient
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar datos" });
    }
};

const getClients = async (req, res) => {
    const { search } = req.query;

    try {
        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { document: { [Op.like]: `%${search}%` } }
            ];
        }

        const clients = await Client.findAll({ where, order: [['name', 'ASC']] });
        res.json(clients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los clientes" });
    }
};

const getClientById = async (req, res) => {
    const { id } = req.params;

    try {
        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({ msg: `No existe un cliente con el id ${id}` });
        }
        res.json(client);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el cliente" });
    }
};

const getClientByDocument = async (req, res) => {
    const nationality = String(req.params.nationality || '').toUpperCase();
    const { document } = req.params;

    try {
        const client = await Client.findOne({ where: { nationality, document } });
        if (!client) {
            return res.status(404).json({ msg: `No existe un cliente con el documento ${nationality}-${document}` });
        }
        res.json(client);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el cliente" });
    }
};

const updateClient = async (req, res) => {
    const { id } = req.params;
    const { data, error } = normalizeClient(req.body);
    if (error) {
        return res.status(400).json({ msg: error });
    }

    try {
        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({ msg: `No existe un cliente con el id ${id}` });
        }

        const duplicated = await Client.findOne({
            where: { nationality: data.nationality, document: data.document, id: { [Op.ne]: id } }
        });
        if (duplicated) {
            return res.status(400).json({ msg: `Ya existe otro cliente con el documento ${data.nationality}-${data.document}` });
        }

        await Client.update(data, { where: { id } });

        const updatedClient = await Client.findByPk(id);

        res.json({ ok: true, client: updatedClient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar datos' });
    }
};

const changeStateClient = async (req, res) => {
    const { id } = req.params;

    try {
        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({ msg: `No existe un cliente con el id ${id}` });
        }

        await Client.update({ state: !client.state }, { where: { id } });

        const clientChanged = await Client.findByPk(id);

        res.json({ ok: true, client: clientChanged });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al cambiar el estado del cliente' });
    }
};

module.exports = {
    normalizeClient,
    createClient,
    getClients,
    getClientById,
    getClientByDocument,
    updateClient,
    changeStateClient
};
