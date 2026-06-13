const protect = (req, res, next) => {
    let token;

    // Buscamos el token en la cabecera Authorization: Bearer <TOKEN>
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    // Si no se encuentra en Authorization, podemos buscarlo en un Header personalizado ej: "x-api-token"
    if (!token && req.headers["x-api-token"]) {
        token = req.headers["x-api-token"];
    }

    // Validar si el token existe y si coincide EXACTAMENTE con el del .env
    if (token && token === process.env.API_SECRET_TOKEN) {
        return next(); // El token es correcto, da paso al endpoint
    }

    // Si no coincide o no viene, rechazamos la petición
    return res.status(401).json({ 
        message: "Acceso denegado: Token inválido o no suministrado." 
    });
};

module.exports = protect;