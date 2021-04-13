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
const set_transaction_pin_req_1 = require("../models/pin/set/set-transaction-pin-req");
const pin_service_1 = __importDefault(require("../services/auth/pin-service"));
const response_handler_1 = __importDefault(require("../utilities/response-handler"));
class PinController {
    setTransactionPin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            let status = 200;
            let requestId = response_handler_1.default.generateUniqueId();
            console.log(requestId);
            try {
                const { value, error } = set_transaction_pin_req_1.setTransactionPinReq.validate(req.body);
                if (error) {
                    response = response_handler_1.default
                        .commitResponse(requestId, "422", 'Invalid request body', error);
                    status = 422;
                }
                else {
                    yield pin_service_1.default.setTransactionPin(requestId, req.body).then(resp => {
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
exports.default = new PinController();
//# sourceMappingURL=pin-controller.js.map