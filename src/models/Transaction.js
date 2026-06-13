const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    description: { 
        type: String, 
        required: [true, "La descripción es obligatoria"],
        trim: true 
    },
    amount: { 
        type: Number, 
        required: [true, "El monto es obligatorio"] // Usaremos números positivos para ingresos y negativos para gastos
    },
    type: { 
        type: String, 
        required: true, 
        enum: ["income", "expense"] // Solo permite estos dos valores (ingreso o gasto)
    },
    category: { 
        type: String, 
        required: true,
        default: "Otros",
        enum: ["Sueldo", "Comida", "Transporte", "Entretenimiento", "Servicios", "Otros"]
    },
    date: { 
        type: Date, 
        default: Date.now // Si no pones fecha, toma la del día de hoy
    }
}, {
    timestamps: true // Crea automáticamente campos "createdAt" y "updatedAt"
});

module.exports = mongoose.model("Transaction", TransactionSchema);