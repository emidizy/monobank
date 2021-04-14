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
const user_1 = __importDefault(require("../../database/schemas/user"));
const response_handler_1 = __importDefault(require("../../utilities/response-handler"));
const response_codes_1 = require("../../models/response-codes");
class ProfileSearchService {
    searchAppUser(requestId, searchReq) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let result;
                let response = null;
                const { userId, nameToSearch, phoneToSearch, searchByPhone } = searchReq;
                let searchCondition = {};
                if (!searchByPhone && nameToSearch) {
                    searchCondition = { $and: [
                            { isActive: true },
                            { $or: [
                                    { firstname: { $regex: nameToSearch, $options: 'i' } },
                                    { lastname: { $regex: nameToSearch, $options: 'i' } }
                                ] }
                        ] };
                }
                else if (searchByPhone && phoneToSearch) {
                    searchCondition = { $and: [
                            { isActive: true },
                            { phone: phoneToSearch }
                        ] };
                }
                else {
                    response = response_handler_1.default
                        .commitResponse(requestId, response_codes_1.ResponseCodes.INSUFFICIENT_INFO, 'Kindly provide information to be searched', []);
                    return resolve(response);
                }
                yield user_1.default.find(searchCondition, { password: 0, pin: 0 }).then((result) => __awaiter(this, void 0, void 0, function* () {
                    if (!result || result.length == 0) {
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'Sorry, we could not find any user that matches your search', []);
                    }
                    else {
                        let foundUsers = [];
                        for (let user of result) {
                            let profile = user.toJSON();
                            let bankAccounts = profile.bankAccountInfo;
                            const username = `${profile.firstname} ${profile.lastname}`;
                            let clientAppBankAccount = [];
                            for (const account of bankAccounts) {
                                const accountInfo = {
                                    accountNo: account.accountNumber.valueOf(),
                                    currency: account.currency,
                                    balance: account.balance,
                                    accountName: username
                                };
                                clientAppBankAccount.push(accountInfo);
                            }
                            let info = {
                                name: username,
                                phone: profile.phone,
                                email: profile.email,
                                dp: profile.dp,
                                hasBankAccount: profile.hasBankAccount,
                                bankAccount: clientAppBankAccount
                            };
                            foundUsers.push(info);
                        }
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Users found', foundUsers);
                    }
                    resolve(response);
                }))
                    .catch(err => {
                    response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured during the search', err);
                    reject(response);
                });
            }));
        });
    }
    searchUserByAccountNumber(requestId, accountNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let result;
                let response = null;
                let searchCondition = {};
                if (accountNumber) {
                    searchCondition = {
                        $and: [
                            { isActive: true },
                            { bankAccountInfo: {
                                    $elemMatch: { accountNumber: accountNumber }
                                }
                            }
                        ]
                    };
                }
                else {
                    response = response_handler_1.default
                        .commitResponse(requestId, response_codes_1.ResponseCodes.INSUFFICIENT_INFO, 'Kindly provide account number to be searched', []);
                    return resolve(response);
                }
                yield user_1.default.findOne(searchCondition, { password: 0, pin: 0 })
                    .then((result) => __awaiter(this, void 0, void 0, function* () {
                    if (!result) {
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'Sorry, we could not find any user with the specified account number', []);
                    }
                    else {
                        let profile = result.toJSON();
                        const bankAccount = profile.bankAccountInfo.find(x => x.accountNumber == accountNumber);
                        const username = `${profile.firstname} ${profile.lastname}`; //`${user.get('firstname', String)} ${user.get('lastname', String)}`
                        let info = {
                            name: username,
                            phone: profile.phone,
                            email: profile.email,
                            dp: profile.dp,
                            hasBankAccount: profile.hasBankAccount,
                            bankAccount: [{
                                    accountNo: bankAccount.accountNumber.valueOf(),
                                    currency: bankAccount.currency,
                                    balance: bankAccount.balance,
                                    accountName: username
                                }]
                        };
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'User found!', info);
                    }
                    resolve(response);
                }))
                    .catch(err => {
                    response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured during the search', err);
                    reject(response);
                });
            }));
        });
    }
    getUserProfile(requestId, userId, returnAuthFields = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let result;
                let response = null;
                const condition = {
                    $or: [
                        { phone: userId },
                        { email: userId }
                    ]
                };
                const projection = returnAuthFields ? {} : { password: 0, pin: 0 };
                yield user_1.default.findOne(condition, projection).then((data) => __awaiter(this, void 0, void 0, function* () {
                    if (!data) {
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'Sorry, we could not find any user that matches your search', []);
                    }
                    else {
                        let user = data.toJSON();
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'User found', user);
                    }
                    resolve(response);
                }))
                    .catch(err => {
                    response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured during user search', err);
                    reject(response);
                });
            }));
        });
    }
    findUsers(requestId, userIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let result;
                let response = null;
                const condition = {
                    $or: [
                        { phone: { $in: userIds } },
                        { email: { $in: userIds } }
                    ]
                };
                yield user_1.default.find(condition, { password: 0, pin: 0 }).then((data) => __awaiter(this, void 0, void 0, function* () {
                    if (!data || (data === null || data === void 0 ? void 0 : data.length) == 0) {
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'Sorry, we could not find any user that matches your search', []);
                    }
                    else {
                        let foundUsers = [];
                        for (var user of data) {
                            let appUser = user.toJSON();
                            foundUsers.push(appUser);
                        }
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Users found', foundUsers);
                    }
                    resolve(response);
                }))
                    .catch(err => {
                    response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured while looking up user(s)', err);
                    reject(response);
                });
            }));
        });
    }
    getAllUsersInRawDatabaseFormat(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let result;
                let response = null;
                const condition = {};
                yield user_1.default.find(condition, { _id: 0, password: 0, pin: 0 }).then((data) => __awaiter(this, void 0, void 0, function* () {
                    if (!data || (data === null || data === void 0 ? void 0 : data.length) == 0) {
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'Sorry, we could not find any user that matches your search', []);
                    }
                    else {
                        let foundUsers = [];
                        for (var user of data) {
                            let appUser = user.toJSON();
                            foundUsers.push(appUser);
                        }
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Users found', foundUsers);
                    }
                    resolve(response);
                }))
                    .catch(err => {
                    response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured while looking up user(s)', err);
                    reject(response);
                });
            }));
        });
    }
}
exports.default = new ProfileSearchService();
//# sourceMappingURL=search-service.js.map