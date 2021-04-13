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
const search_service_1 = __importDefault(require("../profile/search-service"));
const response_codes_1 = require("../../models/response-codes");
const response_handler_1 = __importDefault(require("../../utilities/response-handler"));
class NameInquiryService {
    doBankAccountNameInquiry(requestId, accountNameInquiryReq) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const { userId, accountNumber } = accountNameInquiryReq;
            const log = JSON.parse(JSON.stringify(accountNameInquiryReq));
            request_logger_1.logActivity(requestId, 'doBankAccountNameInquiry', log);
            //Verify that user id exist
            yield search_service_1.default.findUsers(requestId, [userId])
                .then((status) => __awaiter(this, void 0, void 0, function* () {
                response = status;
                if (status.code != response_codes_1.ResponseCodes.SUCCESS) {
                    return resolve(response);
                }
                else {
                    //PROCEED WITH NAME INQUIRY
                    yield search_service_1.default.searchUserByAccountNumber(requestId, accountNumber)
                        .then((result) => __awaiter(this, void 0, void 0, function* () {
                        if (result.code != response_codes_1.ResponseCodes.SUCCESS) {
                            response = result;
                        }
                        //Else terminate transaction
                        else {
                            const accountHolder = result.data;
                            const userInfo = {
                                name: accountHolder === null || accountHolder === void 0 ? void 0 : accountHolder.name,
                                dp: accountHolder === null || accountHolder === void 0 ? void 0 : accountHolder.dp
                            };
                            response = response_handler_1.default
                                .commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Success! account inquiry successful', userInfo);
                        }
                        resolve(response);
                    }))
                        .catch(err => {
                        response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured while validating account number. Please retry');
                        reject(response);
                    });
                }
            }))
                .catch(err => {
                response = err;
                reject(response);
            });
        }));
    }
}
exports.default = new NameInquiryService();
//# sourceMappingURL=name-inquiry-service.js.map