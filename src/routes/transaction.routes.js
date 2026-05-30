const {Router} = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const transactionController = require('../controller/transaction.controller')

const transactionRoutes = Router();

/**
 * - POST /api/transactions
 * - Create new transaction
 */

transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)

module.exports = transactionRoutes