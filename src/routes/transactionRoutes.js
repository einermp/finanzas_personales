const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const protect = require("../middleware/authMiddleware");

//Aplicamos el token de seguridad a todas las rutas de este archivo
router.use(protect);

// ==========================================
// 1. CREAR UNA TRANSACCIÓN (Ingreso o Gasto)
// ==========================================
router.post("/", async (req, res) => {
    try {
        const { description, amount, type, category, date } = req.body;

        // Lógica de negocio: Forzar que los gastos sean guardados como números negativos
        let finalAmount = amount;
        if (type === "expense" && amount > 0) {
            finalAmount = -amount;
        } else if (type === "income" && amount < 0) {
            finalAmount = Math.abs(amount); // Asegurar que el ingreso sea positivo
        }

        const newTransaction = new Transaction({
            description,
            amount: finalAmount,
            type,
            category,
            date
        });

        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ==========================================
// 2. OBTENER TRANSACCIONES (Con filtros opcionales)
// ==========================================
// Ejemplo de uso: /api/transactions?type=expense&category=Comida
router.get("/", async (req, res) => {
    try {
        const { type, category } = req.query;
        let queryFilters = {};

        // Si el usuario manda un filtro por tipo (income/expense), lo aplicamos
        if (type) queryFilters.type = type;
        
        // Si filtra por categoría, lo aplicamos
        if (category) queryFilters.category = category;

        // Buscamos en la BD ordenando de la más reciente a la más antigua
        const transactions = await Transaction.find(queryFilters).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// 3. OBTENER EL BALANCE GENERAL (Resumen)
// ==========================================
router.get("/balance", async (req, res) => {
    try {
        const transactions = await Transaction.find();

        // Inicializamos los contadores
        let totalIncome = 0;
        let totalExpenses = 0;

        // Sumamos dinámicamente según el tipo
        transactions.forEach(t => {
            if (t.type === "income") {
                totalIncome += t.amount;
            } else if (t.type === "expense") {
                totalExpenses += Math.abs(t.amount); // Lo sumamos como positivo para el reporte
            }
        });

        const currentBalance = totalIncome - totalExpenses;

        res.json({
            total_ingresos: totalIncome,
            total_gastos: totalExpenses,
            balance_actual: currentBalance,
            estado: currentBalance >= 0 ? "Saludable" : "En quiebra"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// E. MODIFICAR / ACTUALIZAR UNA TRANSACCIÓN (PUT)
// ==========================================
// Ruta: /api/transactions/:id
router.put("/:id", async (req, res) => {
    try {
        const { description, amount, type, category, date } = req.body;

        // Buscamos si el registro existe
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: "Transacción no encontrada" });
        }

        // Si el usuario modifica el monto o el tipo, recalculamos el signo (+ o -)
        let finalAmount = amount !== undefined ? amount : transaction.amount;
        const finalType = type || transaction.type;

        if (finalType === "expense" && finalAmount > 0) {
            finalAmount = -finalAmount;
        } else if (finalType === "income" && finalAmount < 0) {
            finalAmount = Math.abs(finalAmount);
        }

        // Actualizamos los campos en la base de datos
        transaction.description = description || transaction.description;
        transaction.amount = finalAmount;
        transaction.type = finalType;
        transaction.category = category || transaction.category;
        transaction.date = date || transaction.date;

        const updatedTransaction = await transaction.save();
        res.json(updatedTransaction);
    }
    catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "ID con formato inválido" });
        }
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// 4. ELIMINAR UNA TRANSACCIÓN
// ==========================================
router.delete("/:id", async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ message: "Transacción no encontrada" });
        }

        await transaction.deleteOne();
        res.json({ message: "Transacción eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;