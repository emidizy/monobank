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
const request_logger_1 = require("../../interceptors/request-logger");
const user_1 = __importDefault(require("../../database/schemas/user"));
const response_handler_1 = __importDefault(require("../../utilities/response-handler"));
const response_codes_1 = require("../../models/response-codes");
const cipher_1 = __importDefault(require("../../utilities/cipher"));
const profile_update_service_1 = __importDefault(require("../profile/profile-update-service"));
class LoginService {
    doLogin(requestId, loginReq) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            request_logger_1.logActivity(requestId, 'LoginService|doLogin', loginReq.userId);
            let response = null;
            var condition = {
                $or: [
                    { phone: loginReq.userId },
                    { email: loginReq.userId }
                ]
            };
            yield user_1.default.findOne(condition, { pin: 0 })
                .then(data => {
                var _a, _b, _c, _d, _e, _f, _g;
                var userprofile = data === null || data === void 0 ? void 0 : data.toJSON();
                if (!data) {
                    response = response_handler_1.default
                        .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'Incorrect username and/or password!');
                }
                else if (!userprofile.isActive) {
                    response = response_handler_1.default
                        .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_PERMITTED, `Sorry, profile activation required!, Please contact support at ${process.env.SupportMail}`);
                }
                else {
                    const isValidPass = cipher_1.default.verifyHash(loginReq.password, userprofile.password);
                    if (!isValidPass) {
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.UNAUTHORIZED, 'Login failed. Incorrect credentials!');
                    }
                    else {
                        const userBankAccount = [];
                        for (var account of userprofile === null || userprofile === void 0 ? void 0 : userprofile.bankAccountInfo) {
                            let bankDetail = {
                                accountNo: account.accountNumber,
                                accountName: `${userprofile.firstname} ${userprofile.lastname}`,
                                currency: account.currency,
                                balance: account.balance
                            };
                            userBankAccount.push(bankDetail);
                        }
                        const kycLevel = profile_update_service_1.default.getAccountTier(userprofile);
                        const kycInfo = {
                            level: kycLevel === null || kycLevel === void 0 ? void 0 : kycLevel.level,
                            alias: kycLevel === null || kycLevel === void 0 ? void 0 : kycLevel.alias,
                            isVerifiedLevel: (_a = userprofile === null || userprofile === void 0 ? void 0 : userprofile.kyc) === null || _a === void 0 ? void 0 : _a.isVerifiedLevel,
                            gender: (_c = (_b = userprofile === null || userprofile === void 0 ? void 0 : userprofile.kyc) === null || _b === void 0 ? void 0 : _b.gender) !== null && _c !== void 0 ? _c : null,
                            resAddress: (_e = (_d = userprofile === null || userprofile === void 0 ? void 0 : userprofile.address) === null || _d === void 0 ? void 0 : _d.valueOf()) !== null && _e !== void 0 ? _e : null,
                            nationality: (_g = (_f = userprofile === null || userprofile === void 0 ? void 0 : userprofile.kyc) === null || _f === void 0 ? void 0 : _f.nationality) !== null && _g !== void 0 ? _g : null
                        };
                        const loggedInUser = {
                            firstname: userprofile.firstname,
                            lastname: userprofile.lastname,
                            phone: userprofile.phone,
                            email: userprofile.email,
                            dp: userprofile.dp,
                            hasPin: userprofile.hasPin,
                            hasBankAccount: userprofile.hasBankAccount,
                            bankAccountInfo: userBankAccount,
                            isLoggedIn: true,
                            kyc: kycInfo
                        };
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Login successful', loggedInUser);
                        resolve(response);
                        return;
                    }
                }
                resolve(response);
            })
                .catch(err => {
                console.log(err);
                request_logger_1.logActivity(requestId, 'LoginService|doLogin|err', err);
                response = response_handler_1.default.handleException(requestId, 'Sorry, an unexpected error occoured while processing your login');
                reject(response);
            });
        }));
    }
}
exports.default = new LoginService();
//# sourceMappingURL=login-service.js.map