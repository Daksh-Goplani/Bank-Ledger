const express = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const accountControl = require('../controller/account.controller')

const router = express.Router()

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route (valid token needed)
 */
router.post('/accounts', authMiddleware.authMiddleware, accountControl.createAccountController)


module.exports = router