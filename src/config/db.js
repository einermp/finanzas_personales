const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB conectado con éxito");
    }
    catch (error) {
        console.error("Error al conectar a MongoDB:", error);
        console.dir(error.reason, { depth: null });
        process.exit(1); // Detener la app si falla la conexión
    }
};

module.exports = connectDB;