const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const emailService = require('../services/email.service')
const accountModel = require("../models/account.model")
const mongoose = require("mongoose")
const transacitonModel = require("../models/transaction.model")


/**
 * - Create New Transaction
 */
async function createTransaction(req, res) {

    /**
     * 1. Validate Request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount, idempotencyKey is required"
        })
    }
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    })
    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount or both"
        })
    }

    /**
     * 2. Validate Idempotency Key
     */

    const isTransactionAlreadyExist = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExist) {
        if (isTransactionAlreadyExist.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExist
            })
        }
        if (isTransactionAlreadyExist.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing"
            })
        }
        if (isTransactionAlreadyExist.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }
        if (isTransactionAlreadyExist.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }

    /**
     * 3. Check account status
     */
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }

    /** 
     * 4. Derive sender balance from ledger
     */
    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance ${balance}. Requested amount ${amount}`
        })
    }
    let transaction
    try {
        /**
         * 5. Create Transaction (PENDING)
         */
        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0]

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: 'DEBIT'
        }], { session })

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: 'CREDIT'
        }], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )

        await session.commitTransaction()
        session.endSession()
    } catch (err) {
        return res.status(400).json({
            message:"Transacion is pending due to some issue please retry after sometime"
        })
    }

    /**
     * 10. Send Email Notification
     */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })
}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount, idempotencyKey are required"
        })
    }
    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })
    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }
    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })
    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transacitonModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })


    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
    }], { session })

    transaction.status = 'COMPLETED'
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed success",
        transaction: transaction
    })
}


module.exports = {
    createTransaction,
    createInitialFundsTransaction
}