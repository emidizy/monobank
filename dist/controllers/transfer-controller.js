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
const response_handler_1 = __importDefault(require("../utilities/response-handler"));
const intrabank_transfer_req_1 = require("../models/transfer/intrabank/intrabank-transfer-req");
const transfer_service_1 = __importDefault(require("../services/transfer/transfer-service"));
const transfer_history_req_1 = require("../models/transfer/history/transfer-history-req");
const name_inquiry_service_1 = __importDefault(require("../services/transfer/name-inquiry-service"));
const bank_name_inquiry_req_1 = require("../models/transfer/name-inquiry/bank/bank-name-inquiry-req");
const get_tx_charge_req_1 = require("../models/transfer/fees/get-tx-charge-req");
class TransferController {
    doIntraBankTransfer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            let status = 200;
            let requestId = response_handler_1.default.generateUniqueId();
            console.log(requestId);
            try {
                const { value, error } = intrabank_transfer_req_1.IntraBankTransferReq.validate(req.body);
                if (error) {
                    response = response_handler_1.default
                        .commitResponse(requestId, "422", 'Invalid request body', error);
                    status = 422;
                }
                else {
                    yield transfer_service_1.default.doIntraBankTransfer(requestId, req.body).then(resp => {
                        response = resp;
                    })
                        .catch(err => {
                        response = err;
                    });
                }
            }
            catch (err) {
                response = response_handler_1.default.handleException(requestId);
            }
            res.locals.logInfo = response;
            res.status(status).send(response);
            next();
        });
    }
    transactionHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            let status = 200;
            let requestId = response_handler_1.default.generateUniqueId();
            console.log(requestId);
            try {
                const { value, error } = transfer_history_req_1.transferHistoryReq.validate(req.body);
                if (error) {
                    response = response_handler_1.default
                        .commitResponse(requestId, "422", 'Invalid request body', error);
                    status = 422;
                }
                else {
                    yield transfer_service_1.default.getTransactionHistory(requestId, req.body).then(resp => {
                        response = resp;
                    })
                        .catch(err => {
                        response = err;
                    });
                }
            }
            catch (err) {
                response = response_handler_1.default.handleException(requestId);
            }
            res.locals.logInfo = response;
            res.status(status).send(response);
            next();
        });
    }
    bankAccountNameInquiry(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            let status = 200;
            let requestId = response_handler_1.default.generateUniqueId();
            console.log(requestId);
            try {
                const { value, error } = bank_name_inquiry_req_1.bankNameInquiryReq.validate(req.body);
                if (error) {
                    response = response_handler_1.default
                        .commitResponse(requestId, "422", 'Invalid request body', error);
                    status = 422;
                }
                else {
                    yield name_inquiry_service_1.default.doBankAccountNameInquiry(requestId, req.body).then(resp => {
                        response = resp;
                    })
                        .catch(err => {
                        response = err;
                    });
                }
            }
            catch (err) {
                response = response_handler_1.default.handleException(requestId);
            }
            res.locals.logInfo = response;
            res.status(status).send(response);
            next();
        });
    }
    getTransferCharges(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            let status = 200;
            let requestId = response_handler_1.default.generateUniqueId();
            console.log(requestId);
            try {
                const { value, error } = get_tx_charge_req_1.getTxChargeReq.validate(req.body);
                if (error) {
                    response = response_handler_1.default
                        .commitResponse(requestId, "422", 'Invalid request body', error);
                    status = 422;
                }
                else {
                    yield transfer_service_1.default.getCharges(requestId, req.body)
                        .then(resp => {
                        response = resp;
                    })
                        .catch(err => {
                        response = err;
                    });
                }
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
exports.default = new TransferController();
//# sourceMappingURL=transfer-controller.js.map