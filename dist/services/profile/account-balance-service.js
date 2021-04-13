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
const search_service_1 = __importDefault(require("./search-service"));
class AccountBalanceService {
    getAccountBalance(requestId, req) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const { userId, accountNumber } = req;
                let response = null;
                search_service_1.default.getUserProfile(requestId, userId)
                    .then(res => {
                    if (res.code != response_codes_1.ResponseCodes.SUCCESS) {
                        response = res;
                    }
                    else {
                        const user = res.data;
                        const bankAcounts = user === null || user === void 0 ? void 0 : user.bankAccountInfo;
                        const account = bankAcounts.find(x => x.accountNumber == accountNumber);
                        if (accountNumber && !account) {
                            response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'Sorry, we could not find the specified account number on user\'s profile');
                        }
                        else if (accountNumber && account) {
                            let accountBalanceResponseData = [];
                            const accountBalanceInfo = {
                                accountNumber: account.accountNumber,
                                balance: account === null || account === void 0 ? void 0 : account.balance,
                                lien: account.lien
                            };
                            accountBalanceResponseData.push(accountBalanceInfo);
                            response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Success!, Account Balance Retrieved', accountBalanceResponseData);
                        }
                        else {
                            let accountBalanceResponseData = [];
                            for (const acct of bankAcounts) {
                                const accountBalanceInfo = {
                                    accountNumber: acct.accountNumber,
                                    balance: acct === null || acct === void 0 ? void 0 : acct.balance,
                                    lien: account.lien
                                };
                                accountBalanceResponseData.push(accountBalanceInfo);
                            }
                            response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Success!, Account Balance Retrieved', accountBalanceResponseData);
                        }
                    }
                    return resolve(response);
                })
                    .catch(err => {
                    response = err;
                    return reject(err);
                });
            }));
        });
    }
}
exports.default = new AccountBalanceService();
//# sourceMappingURL=account-balance-service.js.map