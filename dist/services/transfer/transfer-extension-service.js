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
const cipher_1 = __importDefault(require("../../utilities/cipher"));
const user_1 = __importDefault(require("../../database/schemas/user"));
const transactions_1 = __importDefault(require("../../database/schemas/transactions"));
const fees_1 = __importDefault(require("../../database/schemas/fees"));
const request_logger_1 = require("../../interceptors/request-logger");
const kyc_service_1 = __importDefault(require("../profile/kyc-service"));
class TransferExtensionService {
    validatePayer(requestId, userId, accountNumber, pin, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let response = null;
                //Confirm payer is a participant of the bill
                const condition = {
                    "phone": userId
                };
                yield user_1.default.findOne(condition).then(data => {
                    var _a;
                    if (!data) {
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, "Sorry, we could not find a profile for this user");
                    }
                    else {
                        var userInfo = data.toJSON();
                        let message = null;
                        let respData = null;
                        let responseCode = response_codes_1.ResponseCodes.UNAUTHORIZED;
                        const userBankAccount = (_a = userInfo === null || userInfo === void 0 ? void 0 : userInfo.bankAccountInfo) === null || _a === void 0 ? void 0 : _a.find(w => w.accountNumber == accountNumber);
                        if (!(userInfo === null || userInfo === void 0 ? void 0 : userInfo.hasBankAccount)) {
                            message = "Sorry, we could not find a bank account on your profile. Kindly create one to continue.";
                        }
                        else if (!(userInfo === null || userInfo === void 0 ? void 0 : userInfo.isActive)) {
                            message = "Sorry, your profile is inactive. Kindly activate your profile to carry out transactions";
                        }
                        else if (!userBankAccount) {
                            message = "Sorry, we may not authorize transaction on this account";
                        }
                        else if (!(userInfo === null || userInfo === void 0 ? void 0 : userInfo.hasPin)) {
                            message = "Sorry, you need to set up a pin to carry out transactions";
                        }
                        else if (!cipher_1.default.verifyHash(pin, userInfo === null || userInfo === void 0 ? void 0 : userInfo.pin)) {
                            message = "Transaction declined. Invalid pin!";
                        }
                        else if (amount && amount > (userBankAccount === null || userBankAccount === void 0 ? void 0 : userBankAccount.balance)) {
                            message = "Sorry, you do not have sufficient funds on your account to perform this transaction";
                            responseCode = response_codes_1.ResponseCodes.INSUFFICIENT_BAL;
                        }
                        else {
                            message = "Payer validation successful!";
                            responseCode = response_codes_1.ResponseCodes.SUCCESS;
                            respData = userInfo;
                        }
                        response = response_handler_1.default
                            .commitResponse(requestId, responseCode, message, respData);
                    }
                    resolve(response);
                })
                    .catch(err => {
                    response = response_handler_1.default
                        .handleException(requestId, 'Sorry, an error occoured while performing payment verification');
                    reject(response);
                });
            }));
        });
    }
    getTransaction(requestId, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            yield transactions_1.default.findOne({ clientReference: transactionId })
                .then(record => {
                if (!record) {
                    response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'No record found');
                }
                else {
                    response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Record found', record);
                }
            })
                .catch(err => {
                response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured while checking records');
            });
            return Promise.resolve(response);
        });
    }
    updateTransactionState(requestId, parameter) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const { transactionId, fieldToUpdate, value } = parameter;
            yield transactions_1.default.updateOne({ tranId: transactionId }, { $set: { [fieldToUpdate]: value } })
                .then(record => {
                response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Transaction state updated', record);
            })
                .catch(err => {
                response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured while updating transaction state');
            });
            return Promise.resolve(response);
        });
    }
    updateCreditStatus(requestId, parameter) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const { transactionId, recipientAccount, fieldToUpdate, value } = parameter;
            const condition = {
                $and: [
                    { tranId: transactionId }
                    //{'destination.$.recipientAccount': recipientAccount}
                ]
            };
            const update = {
                $set: {
                    [`destination.$[accounts].${fieldToUpdate}`]: value
                }
            };
            const filter = {
                arrayFilters: [{
                        "accounts.recipientAccount": recipientAccount
                    }],
                new: true,
            };
            yield transactions_1.default.updateOne(condition, update, filter)
                .then(record => {
                response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Transaction state updated', record);
            })
                .catch(err => {
                response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured while updating transaction state');
            });
            return Promise.resolve(response);
        });
    }
    getTransactionCharge(requestId, amount, transferType) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let response = null;
            yield fees_1.default.findOne({}, { _id: 0 })
                .then(data => {
                if (!data) {
                    response = response_handler_1.default
                        .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'Sorry, we could not determine charges at the moment. Please retry later');
                }
                else {
                    const transferFees = data.toJSON();
                    let charges;
                    let txCharge = 0;
                    if (transferType == 'intrabank') {
                        const bankCharges = transferFees === null || transferFees === void 0 ? void 0 : transferFees.bankTransfer[0];
                        if (amount < 5000) {
                            txCharge = bankCharges === null || bankCharges === void 0 ? void 0 : bankCharges.below5K;
                        }
                        else if (amount >= 5000 && amount <= 50000) {
                            txCharge = bankCharges === null || bankCharges === void 0 ? void 0 : bankCharges.btwn5KAnd50K;
                        }
                        else {
                            txCharge = bankCharges === null || bankCharges === void 0 ? void 0 : bankCharges.above50K;
                        }
                        charges = {
                            txCharge: txCharge,
                            rates: bankCharges
                        };
                        response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Success! charges retrieved', charges);
                    }
                    else {
                        response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'Invalid transation type. Transaction type must be \'intrabank\'', charges);
                    }
                }
                resolve(response);
            })
                .catch(err => {
                console.log(err);
                request_logger_1.logActivity(requestId, 'getTransactionCharge|err', err);
                response = response_handler_1.default
                    .handleException(requestId, 'Sorry, we could not determine charges at the moment. Please retry later');
                reject(response);
            });
        }));
    }
    isTransactionLimitExceeded(requestId, user, accountNumber, amount) {
        var _a, _b;
        let response = null;
        const maxEligibleAmount = kyc_service_1.default.getTxLimitForAccountTier(user);
        const account = (_a = user === null || user === void 0 ? void 0 : user.bankAccountInfo) === null || _a === void 0 ? void 0 : _a.find(w => w.accountNumber == accountNumber);
        const accountBal = (_b = account === null || account === void 0 ? void 0 : account.balance) === null || _b === void 0 ? void 0 : _b.valueOf();
        if (!account) {
            response = response_handler_1.default
                .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, `Sorry, we could not validate your wallet ID at the moment`);
        }
        else if (accountBal > maxEligibleAmount) {
            response = response_handler_1.default
                .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_PERMITTED, `Sorry, maximum account balance for your current account level is ${account.currency} ${maxEligibleAmount}`);
        }
        else if (amount > maxEligibleAmount) {
            response = response_handler_1.default
                .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_PERMITTED, `Sorry, amount exceeds transaction limit for your current account level`);
        }
        else if ((accountBal + amount) > maxEligibleAmount) {
            response = response_handler_1.default
                .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_PERMITTED, `Sorry, amount would exceed maximum account balance for your current account level (${account.currency} ${maxEligibleAmount})`);
        }
        else {
            response = response_handler_1.default
                .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, `Success!, amount is within transaction limit`);
        }
        return response;
    }
}
exports.default = new TransferExtensionService();
//# sourceMappingURL=transfer-extension-service.js.map