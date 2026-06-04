const jwt = require('jsonwebtoken');

const generarJWT = (id) => {
    return new Promise((resolve, reject) => {
        // El payload contiene el ID del usuario para que el middleware lo pueda leer
        const payload = { id };

        // Firmamos el token utilizando tu variable de entorno y configuramos la expiración
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Asegúrate de tener esta variable en tu archivo .env
            {
                expiresIn: '5d', // Expira en 5 días (haciendo match con tu login)
            },
            (err, token) => {
                if (err) {
                    console.log(err);
                    reject('No se pudo generar el token');
                } else {
                    resolve(token);
                }
            }
        );
    });
};

module.exports = generarJWT;