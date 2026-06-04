const User = require("../models/User");
const bcrypt = require("bcrypt");
const { Op } = require('sequelize');

const createUser = async (req, res) => {
    const data = req.body;

    try {
        // 1. Verificar si el correo ya existe en la base de datos
        await User.sync();

        const emailExists = await User.findOne({ where: { email: data.email } });
        if (emailExists) {
            return res.status(400).json({ // Cambiado a 400 (Bad Request) que es más adecuado para duplicados
                msg: 'El correo electrónico ya está en uso',
            });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await User.create({
            ...data,
            password: hashedPassword,
        });

        // 4. Responder al cliente con el usuario creado
        res.status(201).json({ // 201 significa "Creado con éxito"
            msg: "Usuario agregado con éxito",
            user: newUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al procesar datos"
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener los usuarios"
        });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params; // Se asume que el ID viene en la URL (ej: /users/:id)

    try {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] } // Protege la contraseña
        });

        if (!user) {
            return res.status(404).json({
                msg: `No existe un usuario con el id ${id}`
            });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener el usuario"
        });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {

        // 2. Si el correo está libre, procedemos con la actualización directa
        await User.update({
            name: data.name,
            lastName: data.lastName,
            rol: data.rol,
            state: data.state
        }, {
            where: { id: id }
        });

        // 3. Buscamos el usuario actualizado para retornar los cambios sin la contraseña
        const usuarioAct = await User.findOne({
            where: { id: id },
            attributes: { exclude: ['password'] }
        });

        res.json({
            ok: true,
            usuarioAct
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            ok: false,
            msg: 'Error al procesar datos'
        });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
};