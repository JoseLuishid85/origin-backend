const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const generarJWT = require('../helpers/generar-jwt'); // Asegúrate de que la ruta a tu helper sea correcta

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar el usuario por email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                msg: 'Credenciales inválidas', // Mensaje genérico por seguridad
            });
        }

        // 2. Verificar si la cuenta está activa (tu modelo usa 'state')
        if (user.state === false) {
            return res.status(401).json({
                data: undefined,
                msg: 'Su cuenta está Desactivada'
            });
        }

        // 3. Comparar la contraseña ingresada con el hash de la base de datos
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                msg: 'Credenciales inválidas',
            });
        }

        // 4. Generar el token JWT usando el ID del usuario
        const token = await generarJWT(user.id);
        const expiresIn = 5 * 24 * 60 * 60; // 5 días

        // Opcional: Excluir la contraseña del objeto antes de enviarlo al frontend
        const userResponse = user.toJSON();
        delete userResponse.password;

        // 5. Responder con éxito
        res.json({
            msg: 'Inicio de sesión exitoso',
            user: userResponse,
            expiresIn,
            token: token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al procesar la solicitud',
        });
    }
};

module.exports = {
    loginUser
};