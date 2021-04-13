"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Initialize express router 
const express = __importStar(require("express"));
const transfer_controller_1 = __importDefault(require("../controllers/transfer-controller"));
class TransferRoutes {
    constructor() {
        this.routes = express.Router();
        this.initRoutes();
    }
    initRoutes() {
        this.routes.post('/bank/account/enquire', transfer_controller_1.default.bankAccountNameInquiry);
        this.routes.post('/charges', transfer_controller_1.default.getTransferCharges);
        this.routes.post('/intrabank', transfer_controller_1.default.doIntraBankTransfer);
        this.routes.post('/history', transfer_controller_1.default.transactionHistory);
    }
}
exports.default = new TransferRoutes();
//# sourceMappingURL=transfer-routes.js.map