const express = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const accountControl = require('../controller/account.controller')

const router = express.Router()

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route (valid token needed)
 */
router.post('/', authMiddleware.authMiddleware, accountControl.createAccountController)


/**
 * - GET api/accounts
 * - Get all accounts of logged-in user
 * - Protected route
 */
router.get("/", authMiddleware.authMiddleware, accountControl.getUserAccountsController)


/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware,
    accountControl.getAccountBalaceController
)

module.exports = router