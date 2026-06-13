const express = require("express");
const connectDB = require("./src/config/db.js");

require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para que el servidor entienda formato JSON
app.use(express.json());
app.use("/api/transactions", require("./src/routes/transactionRoutes"));
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});