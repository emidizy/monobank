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
// Import User schema/model
const user_1 = __importDefault(require("../../database/schemas/user"));
const response_handler_1 = __importDefault(require("../../utilities/response-handler"));
const response_codes_1 = require("../../models/response-codes");
const cipher_1 = __importDefault(require("../../utilities/cipher"));
const email_manager_1 = __importDefault(require("../notification/email-manager"));
const config_1 = require("../../config");
const request_logger_1 = require("../../interceptors/request-logger");
const profile_update_service_1 = __importDefault(require("../profile/profile-update-service"));
const search_service_1 = __importDefault(require("../profile/search-service"));
class SignupService {
    createAccount(requestId, newUser) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let response = null;
                const { firstname, lastname, phone, email, dob, password, pin, depositAmount, country, notificationId } = newUser;
                //Check if user already Exists
                user_1.default.findOne({ phone: newUser === null || newUser === void 0 ? void 0 : newUser.phone }).then((user) => __awaiter(this, void 0, void 0, function* () {
                    if (user) {
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_PROCESSED, `Sorry, user is already registered`);
                    }
                    else {
                        //Generate Bank Account
                        yield this.generateBankAccount(requestId)
                            .then((res) => __awaiter(this, void 0, void 0, function* () {
                            let bankAccount = res;
                            bankAccount.balance = depositAmount;
                            const kycLevel = '1';
                            let hashedPassword = cipher_1.default.hash(password);
                            let hashedPin = cipher_1.default.hash(pin);
                            const newUser = {
                                firstname,
                                lastname,
                                phone,
                                email,
                                password: hashedPassword,
                                notificationId,
                                hasBankAccount: true,
                                hasPin: true,
                                pin,
                                bankAccountInfo: [bankAccount],
                                kyc: {
                                    level: kycLevel,
                                    isVerifiedLevel: true,
                                    dob: dob,
                                    isWatchlisted: false
                                },
                            };
                            let userInfo = new user_1.default(newUser);
                            yield userInfo.save()
                                .then((onSuccess) => __awaiter(this, void 0, void 0, function* () {
                                //Todo: Increase Pool Account Balance By deposit Amount
                                const acctTier = profile_update_service_1.default.getAccountTier(newUser);
                                const user = {
                                    firstname: firstname,
                                    lastname: lastname,
                                    phone: phone,
                                    email: email,
                                    dp: null,
                                    notificationId: null,
                                    hasPin: true,
                                    hasBankAccount: true,
                                    bankAccountInfo: [{
                                            accountName: `${newUser.firstname} ${newUser.lastname}`,
                                            accountNo: bankAccount.accountNumber,
                                            currency: bankAccount.currency,
                                            balance: bankAccount.balance
                                        }],
                                    isLoggedIn: true,
                                    kyc: {
                                        level: acctTier === null || acctTier === void 0 ? void 0 : acctTier.level,
                                        alias: acctTier === null || acctTier === void 0 ? void 0 : acctTier.alias,
                                        isVerifiedLevel: true
                                    }
                                };
                                response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, `Welcome to ${config_1.Config.AppName}!`, user);
                                //send welcome email
                                email_manager_1.default.sendWelcomeEmail(requestId, newUser.firstname, newUser.email);
                            }))
                                .catch(err => {
                                console.log(err);
                                response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.UNSUCCESSFUL, 'Sorry, we are unable to create your profile at this time. please retry later');
                            });
                        }))
                            .catch(err => {
                            response = response_handler_1.default.handleException(requestId, 'Sorry, somehing went wrong while creating your account. Please retry later');
                        });
                    }
                    resolve(response);
                }));
            });
        });
    }
    generateAdditionalBankAcount(requestId, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let response = null;
                yield search_service_1.default.getUserProfile(requestId, phoneNumber)
                    .then((res) => __awaiter(this, void 0, void 0, function* () {
                    if (res.code == response_codes_1.ResponseCodes.SUCCESS) {
                        let appUser = res.data;
                        //Generate New Account and Update User Profile
                        yield this.generateBankAccount(requestId).then((newAccount) => __awaiter(this, void 0, void 0, function* () {
                            if (newAccount == null) {
                                response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.UNSUCCESSFUL, 'Sorry, account generation failed. Please retry in a moment');
                            }
                            else {
                                //Save and return generated account
                                const update = {
                                    $set: {
                                        hasBankAccount: true
                                    },
                                    $addToSet: {
                                        bankAccountInfo: newAccount
                                    }
                                };
                                yield user_1.default.updateOne({ phone: phoneNumber }, update)
                                    .then(success => {
                                    let bankAccount = {
                                        accountNo: newAccount === null || newAccount === void 0 ? void 0 : newAccount.accountNumber,
                                        accountName: `${appUser.firstname} ${appUser.lastname}`,
                                        currency: newAccount === null || newAccount === void 0 ? void 0 : newAccount.currency,
                                        balance: 0
                                    };
                                    response = response_handler_1.default
                                        .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Bank Account created successfully', bankAccount);
                                    resolve(response);
                                })
                                    .catch(err => {
                                    request_logger_1.logActivity(requestId, 'signUpService|GenerateAdditionalBankAcount|err', err);
                                    response = response_handler_1.default
                                        .commitResponse(requestId, response_codes_1.ResponseCodes.UNSUCCESSFUL, 'An error occoured while setting up your additional bank account');
                                    reject(response);
                                });
                            }
                        }));
                    }
                    else {
                        response = res;
                        resolve(response);
                    }
                }))
                    .catch(err => {
                    response = err;
                    return reject(err);
                });
            }));
        });
    }
    generateBankAccount(requestId) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let response = null;
            let bankAcount = null;
            const randomNumber = Math.floor(Math.random() * (100000 - 999998 + 1)) + 999998;
            const bankPrefix = 901;
            const accountNumber = `${bankPrefix}${randomNumber}`;
            yield this.checkIfAccountNumberExist(requestId, accountNumber)
                .then(accountExists => {
                if (accountExists) {
                    this.generateBankAccount(requestId);
                }
                else {
                    //Proceed to return new account details
                    bankAcount = {
                        accountId: response_handler_1.default.generateUniqueId(),
                        currency: process.env.DefaultCurrency,
                        balance: 0,
                        lien: 0,
                        accountNumber: accountNumber,
                        createdAt: new Date()
                    };
                    return resolve(bankAcount);
                }
            })
                .catch(err => {
                return reject(response);
            });
        }));
    }
    checkIfAccountNumberExist(requestId, accountNumber) {
        return new Promise((resolve, reject) => {
            const condition = {
                bank_account_info: {
                    $elemMatch: {
                        accountNumber: accountNumber
                    }
                }
            };
            user_1.default.findOne(condition).then((account) => __awaiter(this, void 0, void 0, function* () {
                if (account) {
                    return resolve(true);
                }
                else {
                    return resolve(false);
                }
            }));
        });
    }
}
exports.default = new SignupService();
//# sourceMappingURL=signup-service.js.map