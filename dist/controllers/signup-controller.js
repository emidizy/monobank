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
const signup_service_1 = __importDefault(require("../services/onboarding/signup-service"));
const response_handler_1 = __importDefault(require("../utilities/response-handler"));
const signup_req_1 = require("../models/signup/signup-req");
const generate_new_bank_account_req_1 = require("../models/signup/generate-new-bank-account-req");
const response_codes_1 = require("../models/response-codes");
const session_manager_1 = __importDefault(require("../interceptors/session-manager"));
class SignupController {
    createAccount(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            let status = 200;
            let requestId = response_handler_1.default.generateUniqueId();
            console.log(requestId);
            try {
                const { value, error } = signup_req_1.signupReq.validate(req.body);
                if (error) {
                    response = response_handler_1.default
                        .commitResponse(requestId, "422", 'Invalid request body', error);
                    status = 422;
                }
                else {
                    yield signup_service_1.default.createAccount(requestId, req.body)
                        .then((resp) => __awaiter(this, void 0, void 0, function* () {
                        response = resp;
                        //SET SESSION TOKEN UPON SUCCESSFUL ACCOUNT CREATION
                        if (response.code == response_codes_1.ResponseCodes.SUCCESS) {
                            const user = resp.data;
                            const sessionData = { userId: user.phone };
                            yield session_manager_1.default.setSessionToken(req, sessionData)
                                .then(sessionReq => {
                                req = sessionReq;
                                if (!req.session.accessToken) {
                                    response = response_handler_1.default
                                        .commitResponse(requestId, response_codes_1.ResponseCodes.SESSION_CREATE_ERR, 'Account creation successful. Kindly login to continue');
                                }
                                //else, user is automatically logged in after account creation
                            })
                                .catch(err => {
                                response = response_handler_1.default
                                    .commitResponse(requestId, response_codes_1.ResponseCodes.UNSUCCESSFUL, 'Sorry, we were unable to log you in at this time. Kindly check back in a moment');
                            });
                        }
                    }));
                }
                console.log(`value: ${value} | error: ${error}`);
            }
            catch (err) {
                response = response_handler_1.default.handleException(requestId);
            }
            res.locals.logInfo = response;
            res.status(status).send(response);
            next();
        });
    }
    generateAdditionalBankAccount(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            let status = 200;
            let requestId = response_handler_1.default.generateUniqueId();
            console.log(requestId);
            try {
                const { value, error } = generate_new_bank_account_req_1.generateNewBankAccountReq.validate(req.body);
                if (error) {
                    response = response_handler_1.default
                        .commitResponse(requestId, "422", 'Invalid request body', error);
                    status = 422;
                }
                else {
                    yield signup_service_1.default.generateAdditionalBankAcount(requestId, req.body)
                        .then((resp) => __awaiter(this, void 0, void 0, function* () {
                        response = resp;
                    }));
                }
                console.log(`value: ${value} | error: ${error}`);
            }
            catch (err) {
                response = response_handler_1.default.handleException(requestId);
            }
            res.locals.logInfo = response;
            res.status(status).send(response);
            next();
        });
    }
}
exports.default = new SignupController();
//# sourceMappingURL=signup-controller.js.map