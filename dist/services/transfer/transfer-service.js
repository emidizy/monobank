"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = __importDefault(require("../../utilities/response-handler"));
const response_codes_1 = require("../../models/response-codes");
const transactions_1 = __importDefault(require("../../database/schemas/transactions"));
const user_1 = __importDefault(require("../../database/schemas/user"));
const request_logger_1 = require("../../interceptors/request-logger");
const transfer_extension_service_1 = __importDefault(require("./transfer-extension-service"));
const email_manager_1 = __importDefault(require("../notification/email-manager"));
const queue_manager_1 = __importDefault(require("../../utilities/queue-manager"));
const account_balance_service_1 = __importDefault(require("../profile/account-balance-service"));
class TransferService {
    doIntraBankTransfer(requestId, wallet2WalletTransferReq) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const { userId, sourceAccount, destinationAccount, pin, recipientName, clientTranId, narration, amount, hash } = wallet2WalletTransferReq;
            const log = JSON.parse(JSON.stringify(wallet2WalletTransferReq));
            log.pin = '******';
            request_logger_1.logActivity(requestId, 'doIntraBankTransfer', log);
            let transferCharge = 0.0;
            if (sourceAccount == destinationAccount) {
                response = response_handler_1.default
                    .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_PERMITTED, 'Sorry, transfer to same account is not permitted');
                return resolve(response);
            }
            //Get trasaction charge
            const transactionChargeReq = {
                userId: userId,
                amount: amount,
                transferType: "intrabank"
            };
            //Verify hash
            ///Verify that source wallet belongs to user && destination wallet exist
            yield transfer_extension_service_1.default.validatePayer(requestId, userId, sourceAccount, pin)
                .then((status) => __awaiter(this, void 0, void 0, function* () {
                response = status;
                if (status.code != response_codes_1.ResponseCodes.SUCCESS) {
                    resolve(response);
                }
                else {
                    //PROCEED WITH TRANSACTION
                    const user = status.data;
                    yield this.getCharges(requestId, transactionChargeReq)
                        .then((res) => __awaiter(this, void 0, void 0, function* () {
                        if (res.code == response_codes_1.ResponseCodes.SUCCESS) {
                            transferCharge = response.data.txCharge;
                            //Verify that transaction id does not exist
                            yield transfer_extension_service_1.default.getTransaction(requestId, clientTranId)
                                .then((result) => __awaiter(this, void 0, void 0, function* () {
                                if (result.code == response_codes_1.ResponseCodes.NOT_FOUND) {
                                    //Proceed to save transaction log
                                    const d = new Date();
                                    let randomInt = Math.ceil(Math.random() * 99);
                                    const transferReference = `MON${d.getFullYear()}${d.getMonth()}${d.getDay()}${d.getTime()}${randomInt}`;
                                    const transactionLog = new transactions_1.default({
                                        tranId: transferReference,
                                        clientReference: clientTranId,
                                        senderId: userId,
                                        sourceAccount: sourceAccount,
                                        debitAmount: amount,
                                        destination: [
                                            {
                                                recipientAccount: destinationAccount,
                                                recipientName: recipientName,
                                                amount: amount,
                                                isCreditSuccess: false
                                            }
                                        ],
                                        narration: narration,
                                        date: new Date(),
                                        transactionType: 'intrabank',
                                        isDebitSuccess: false,
                                        status: 'pending'
                                    });
                                    yield transactionLog.save().then((success) => __awaiter(this, void 0, void 0, function* () {
                                        //Debit sender wallet
                                        //update tx debit status
                                        const debitReq = {
                                            phone: userId,
                                            sourceAccount: sourceAccount,
                                            tranId: transferReference,
                                            amount: amount,
                                            transferCharge: 0.0,
                                            narration: narration,
                                            hash: hash
                                        };
                                        yield this.doAccountDebit(requestId, debitReq)
                                            .then((debitStatus) => __awaiter(this, void 0, void 0, function* () {
                                            if (debitStatus.code == "00") {
                                                //credit recipient wallet
                                                //update tx credit status
                                                const creditReq = {
                                                    senderId: userId,
                                                    destinationAccountNumber: destinationAccount,
                                                    tranId: transferReference,
                                                    narration: narration,
                                                    amount: amount,
                                                    hash: hash
                                                };
                                                yield this.doAccountCredit(requestId, creditReq)
                                                    .then((status) => __awaiter(this, void 0, void 0, function* () {
                                                    var _a, _b;
                                                    response = status;
                                                    if (status.code == "00") {
                                                        response.data = debitStatus.data;
                                                        //update transaction status to success
                                                        const state = {
                                                            transactionId: transferReference,
                                                            fieldToUpdate: 'status',
                                                            value: 'success'
                                                        };
                                                        yield transfer_extension_service_1.default.updateTransactionState(requestId, state);
                                                        if (transferCharge > 0) {
                                                            debitReq.amount = transferCharge;
                                                            queue_manager_1.default.doBackgroundTask(requestId, sourceAccount.valueOf(), this.deductServiceCharge(requestId, debitReq));
                                                        }
                                                    }
                                                    else {
                                                        //do reversal
                                                        //I assume there is a pool account where funnds are ware housed
                                                        //Todo: 
                                                        //1.Debit pool account with transfer amount
                                                        //2.Credit Sender's Account with transfer amount
                                                        const totalAmount = amount + transferCharge;
                                                        const reversalReq = {
                                                            senderId: (_b = (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.AppName) !== null && _b !== void 0 ? _b : 'Mono',
                                                            destinationAccount: sourceAccount.valueOf(),
                                                            recipientName: `${user === null || user === void 0 ? void 0 : user.firstname} ${user === null || user === void 0 ? void 0 : user.lastname}`,
                                                            clientTranId: clientTranId.valueOf(),
                                                            narration: `RVSL/${narration}`,
                                                            amount: totalAmount,
                                                            hash: null
                                                        };
                                                        queue_manager_1.default.doBackgroundTask(requestId, sourceAccount.valueOf(), this.doReversal(requestId, reversalReq));
                                                    }
                                                    resolve(response);
                                                }))
                                                    .catch((err) => __awaiter(this, void 0, void 0, function* () {
                                                    response = err;
                                                }));
                                            }
                                            else {
                                                response = status;
                                            }
                                        }))
                                            .catch((err) => __awaiter(this, void 0, void 0, function* () {
                                            response = err;
                                        }));
                                    }))
                                        .catch(err => {
                                        response = response_handler_1.default
                                            .commitResponse(requestId, response_codes_1.ResponseCodes.DB_UPDATE_ERROR, 'Sorry, an error occoured updating transaction entries');
                                    });
                                }
                                //Else terminate transaction
                                else if (result.code == response_codes_1.ResponseCodes.SUCCESS) {
                                    response = response_handler_1.default
                                        .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_PROCESSED, 'Transaction id already exist');
                                }
                                else {
                                    response = result;
                                }
                                resolve(response);
                            }))
                                .catch(err => {
                                response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured while initiating transaction');
                                reject(response);
                            });
                        }
                        else {
                            response = res;
                            resolve(response);
                        }
                    }))
                        .catch(err => {
                        response = err;
                        reject(err);
                    });
                }
            }))
                .catch(err => {
                response = err;
                reject(response);
            });
        }));
    }
    doAccountDebit(requestId, debitReq) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            request_logger_1.logActivity(requestId, 'doAccountDebit - Req', debitReq);
            let response = null;
            let rowsUpdated = [];
            const { phone, sourceAccount, tranId, amount, transferCharge, narration, hash } = debitReq;
            const debitAmt = amount + transferCharge;
            //Get account balance
            const accountBalanceReq = {
                userId: phone,
                accountNumber: sourceAccount
            };
            yield account_balance_service_1.default.getAccountBalance(requestId, accountBalanceReq)
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                if (res.code == response_codes_1.ResponseCodes.SUCCESS) {
                    //
                    const account = res === null || res === void 0 ? void 0 : res.data[0];
                    console.log(account);
                    const withdrawableBalance = (account === null || account === void 0 ? void 0 : account.balance) - (account === null || account === void 0 ? void 0 : account.lien);
                    console.log('withrwbleBal', withdrawableBalance);
                    const balanceAfterTransfer = withdrawableBalance - amount;
                    console.log('balanceAfterTransfer', balanceAfterTransfer);
                    if (!balanceAfterTransfer || balanceAfterTransfer < 0) {
                        const balanceLeft = {
                            withdrawableBalance: withdrawableBalance
                        };
                        response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.INSUFFICIENT_BAL, 'Sorry, you do not have sufficient funds to complete transaction', balanceLeft);
                    }
                    else {
                        //I assume there is a pool account where ALL funds are warehoused and individual accounts are virtual accounts whoose balances are mapped to the Pool account
                        //Since this is an intra bak transfer, total amount in pool account remains same, hence I update the virtual account balances ad create a record for the tansaction
                        //Todo: 
                        //1. Verify Amount does not exceed pool account balance: This verification was intentionally skipped since this implementation does not cover validations for account funding
                        //1.Subtract source account balance with transfer amount
                        //2.Add transfer amount to recepient's Account balance 
                        //Update source account balance
                        const update = {
                            $inc: {
                                'bankAccountInfo.$[account].balance': -amount
                            }
                        };
                        const filter = {
                            arrayFilters: [{
                                    "account.accountNumber": sourceAccount
                                }]
                        };
                        yield user_1.default.updateOne({ $and: [{ phone: phone }, { hasBankAccount: true }] }, update, filter)
                            .then((success) => __awaiter(this, void 0, void 0, function* () {
                            //n: no of records found; nModified: no of records modified
                            rowsUpdated['balanceFieldUpdated'] = success.nModified;
                            //Update debit status to successful
                            const state = {
                                transactionId: tranId,
                                fieldToUpdate: 'isDebitSuccess',
                                value: true
                            };
                            yield transfer_extension_service_1.default.updateTransactionState(requestId, state)
                                .then()
                                .catch();
                            const balance = {
                                balance: balanceAfterTransfer
                            };
                            console.log('balance', balance);
                            response = response_handler_1.default
                                .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Transaction successful!', balance);
                            //Send Payment Notification
                            var notifReq = {
                                title: 'Account Debit on Mono!',
                                accountNo: sourceAccount.toString(),
                                amount: amount,
                                narration: narration.toString(),
                                tranId: tranId.toString(),
                                convenienceFee: transferCharge,
                                date: new Date().toLocaleString(),
                                balance: balanceAfterTransfer,
                                requestId: requestId,
                                userEmail: null,
                                isCreditTx: false
                            };
                            queue_manager_1.default.doBackgroundTask(requestId, queue_manager_1.default.transferNotificationQueueId, email_manager_1.default.sendPaymentNotification(notifReq));
                        }))
                            .catch((err) => __awaiter(this, void 0, void 0, function* () {
                            rowsUpdated['balanceFieldUpdated'] = 0;
                            response = response_handler_1.default.handleException(requestId, 'Sorry, debit operation failed. Please retry later');
                            //Update debit status to unsuccessful
                            const state = {
                                transactionId: tranId,
                                fieldToUpdate: 'status',
                                value: 'failed'
                            };
                            yield transfer_extension_service_1.default.updateTransactionState(requestId, state);
                        }));
                    }
                    request_logger_1.logActivity(requestId, 'doAccountDebit - Resp', response);
                    resolve(response);
                }
                else {
                    response = res;
                    resolve(response);
                }
            }))
                .catch(err => {
                response = err;
                reject(response);
            });
        }));
    }
    doAccountCredit(requestId, creditReq) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            request_logger_1.logActivity(requestId, 'doAccountCredit - Req', creditReq);
            let response = null;
            const { senderId, destinationAccountNumber, tranId, amount, narration, hash } = creditReq;
            const creditAmt = amount;
            //I assume there is a pool account where ALL funds are warehoused and individual accounts are virtual accounts whoose balances are mapped to the Pool account
            //Since this is an intra bank transfer, total amount in pool account remains same, hence I update the virtual account balances ad create a record for the tansaction
            //Todo: 
            //2.Add transfer amount to recepient's Account balance 
            response = response_handler_1.default
                .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Transfer successful!');
            //Update recipient's wallet balance
            const condition = {
                $and: [
                    {
                        bankAccountInfo: {
                            $elemMatch: { accountNumber: destinationAccountNumber }
                        }
                    },
                    {
                        hasBankAccount: true
                    }
                ]
            };
            const update = {
                $inc: {
                    'bankAccountInfo.$[account].balance': amount
                }
            };
            const filter = {
                arrayFilters: [{
                        "account.accountNumber": destinationAccountNumber
                    }]
            };
            yield user_1.default.updateOne(condition, update, filter)
                .then((success) => __awaiter(this, void 0, void 0, function* () {
                //update isCreditSuccess to true
                console.log(success);
                const state = {
                    transactionId: tranId,
                    recipientAccount: destinationAccountNumber,
                    fieldToUpdate: 'isCreditSuccess',
                    value: true
                };
                yield transfer_extension_service_1.default.updateCreditStatus(requestId, state);
                //Send Payment Notification
                var notifReq = {
                    title: 'You Have Been Credited Successfully!',
                    accountNo: destinationAccountNumber.toString(),
                    amount: amount,
                    narration: narration.toString(),
                    tranId: tranId.toString(),
                    convenienceFee: 0,
                    date: new Date().toLocaleString(),
                    requestId: requestId,
                    userEmail: null,
                    isCreditTx: true
                };
                queue_manager_1.default.doBackgroundTask(requestId, queue_manager_1.default.transferNotificationQueueId, email_manager_1.default.sendPaymentNotification(notifReq));
            }))
                .catch((err) => __awaiter(this, void 0, void 0, function* () {
                response = response_handler_1.default
                    .commitResponse(requestId, response_codes_1.ResponseCodes.UNSUCCESSFUL, 'Sorry, credit transaction failed!');
                //update Transaction State to failed
                const state = {
                    transactionId: tranId,
                    fieldToUpdate: 'status',
                    value: 'failed'
                };
                yield transfer_extension_service_1.default.updateTransactionState(requestId, state);
            }));
            request_logger_1.logActivity(requestId, 'doAccountCredit - Resp', response);
            resolve(response);
        }));
    }
    getTransactionHistory(requestId, request) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            request_logger_1.logActivity(requestId, 'getTransactions - Req', request);
            let response = null;
            const { accountNo, days, hash } = request;
            let now = new Date();
            now.setDate(now.getDate() - days).toLocaleString();
            const condition = {
                $or: [
                    {
                        $and: [
                            {
                                sourceAccount: accountNo
                            },
                            {
                                transactionType: 'intrabank'
                            }
                        ]
                    },
                    {
                        $and: [
                            {
                                destination: {
                                    $elemMatch: { recipientAccount: accountNo }
                                }
                            },
                            {
                                transactionType: 'intrabank'
                            }
                        ]
                    },
                    {
                        $and: [
                            {
                                sourceAccount: accountNo
                            },
                            {
                                transactionType: 'service-charge'
                            }
                        ]
                    },
                ],
                date: {
                    $gte: now !== null && now !== void 0 ? now : new Date()
                },
                status: 'success'
            };
            const ignore = {
                _id: 0,
                tranId: 0,
                __v: 0
            };
            yield transactions_1.default.find(condition, ignore)
                .then(data => {
                if (!data || data.length == 0) {
                    response = response_handler_1.default
                        .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'You have not made any transaction yet');
                }
                else {
                    response = response_handler_1.default
                        .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Success! Transactions retrieved.', data);
                }
                resolve(response);
            })
                .catch(err => {
                console.log(err);
                response = response_handler_1.default
                    .handleException(requestId, 'Sorry, an error occoured while processing your request');
                reject(response);
            });
        }));
    }
    deductServiceCharge(requestId, schargeReq) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const incomeAccount = process.env.CMFWID;
            //I assume this income account is an internal bank account (mapped to the pool account) which has already been provisioned
            const destinationAccountNumber = incomeAccount;
            const d = new Date();
            let randomInt = Math.ceil(Math.random() * 99);
            const transferReference = `INC${d.getFullYear()}${d.getMonth()}${d.getDay()}${d.getTime()}${randomInt}`;
            const transactionLog = new transactions_1.default({
                tranId: transferReference,
                clientReference: schargeReq.tranId,
                senderId: schargeReq.phone,
                sourceAccount: schargeReq.sourceAccount,
                debitAmount: schargeReq.amount,
                destination: [
                    {
                        recipientAccount: incomeAccount,
                        recipientName: 'Income Account',
                        amount: schargeReq.amount,
                        isCreditSuccess: false
                    }
                ],
                narration: schargeReq.narration,
                date: new Date(),
                transactionType: 'service-charge',
                isDebitSuccess: true,
                status: 'pending'
            });
            yield transactionLog.save()
                .then((success) => __awaiter(this, void 0, void 0, function* () {
                //Credit income  account and update transaction state
                schargeReq.tranId = transferReference;
                //Deduct service charge
                yield this.doAccountDebit(requestId, schargeReq)
                    .then((res) => __awaiter(this, void 0, void 0, function* () {
                    if (res.code == response_codes_1.ResponseCodes.SUCCESS) {
                        //Credit Income account
                        const creditReq = {
                            senderId: schargeReq.phone,
                            destinationAccountNumber: destinationAccountNumber,
                            tranId: transferReference,
                            narration: schargeReq.narration,
                            amount: schargeReq.amount,
                            hash: schargeReq.hash
                        };
                        yield this.doAccountCredit(requestId, creditReq)
                            .then((status) => __awaiter(this, void 0, void 0, function* () {
                            response = status;
                            if (status.code == "00") {
                                //update transaction status to success
                                const state = {
                                    transactionId: transferReference,
                                    fieldToUpdate: 'status',
                                    value: 'success'
                                };
                                yield transfer_extension_service_1.default.updateTransactionState(requestId, state);
                            }
                            request_logger_1.logActivity(requestId, 'transferService|deductServiceCharge', response);
                            resolve(response);
                        }))
                            .catch((err) => __awaiter(this, void 0, void 0, function* () {
                            response = err;
                            console.log(err);
                            request_logger_1.logActivity(requestId, 'transferService|deductServiceCharge|err', err);
                            return reject(response);
                        }));
                    }
                }));
            }))
                .catch(err => {
                response = response_handler_1.default
                    .commitResponse(requestId, response_codes_1.ResponseCodes.DB_UPDATE_ERROR, 'Sorry, an error occoured updating transaction entries');
                request_logger_1.logActivity(requestId, 'transferService|deductServiceCharge|err', err);
                return reject(response);
            });
        }));
    }
    doReversal(requestId, reversalReq) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            let response = null;
            const { senderId, destinationAccount, recipientName, clientTranId, amount, narration, hash } = reversalReq;
            const d = new Date();
            let randomInt = Math.ceil(Math.random() * 99);
            const transferReference = `P${d.getFullYear()}${d.getMonth()}${d.getDay()}${d.getTime()}${randomInt}`;
            //Note source account is the Pool Account
            const transactionLog = new transactions_1.default({
                tranId: transferReference,
                clientReference: clientTranId,
                senderId: senderId,
                sourceAccount: (_a = process.env.AppName) !== null && _a !== void 0 ? _a : 'Mono Bank',
                debitAmount: amount,
                destination: [
                    {
                        recipientAccount: destinationAccount,
                        recipientName: recipientName,
                        amount: amount,
                        isCreditSuccess: false
                    }
                ],
                narration: narration,
                date: new Date(),
                transactionType: 'reversal',
                isDebitSuccess: true,
                status: 'pending'
            });
            yield transactionLog.save()
                .then((success) => __awaiter(this, void 0, void 0, function* () {
                //Credit user wallet account and update transaction state
                const refundReq = {
                    senderId: senderId,
                    destinationAccountNumber: destinationAccount,
                    amount: amount,
                    narration: narration,
                    tranId: transferReference.valueOf()
                };
                yield this.doAccountCredit(requestId, refundReq)
                    .then((status) => __awaiter(this, void 0, void 0, function* () {
                    response = status;
                    if (status.code == "00") {
                        //update transaction status to success
                        const state = {
                            transactionId: transferReference,
                            fieldToUpdate: 'status',
                            value: 'success'
                        };
                        yield transfer_extension_service_1.default.updateTransactionState(requestId, state);
                    }
                    resolve(response);
                }))
                    .catch((err) => __awaiter(this, void 0, void 0, function* () {
                    response = err;
                }));
            }))
                .catch(err => {
                response = response_handler_1.default
                    .commitResponse(requestId, response_codes_1.ResponseCodes.DB_UPDATE_ERROR, 'Sorry, an error occoured updating transaction entries');
            });
        }));
    }
    getCharges(requestId, chargesReq) {
        const { amount, transferType } = chargesReq;
        return transfer_extension_service_1.default.getTransactionCharge(requestId, amount, transferType);
    }
}
exports.default = new TransferService();
//# sourceMappingURL=transfer-service.js.map