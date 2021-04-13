"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const profile_update_service_1 = __importDefault(require("./profile-update-service"));
class KycService {
    getTxLimitForAccountTier(user) {
        const kyc = profile_update_service_1.default.getAccountTier(user);
        let amount = process.env.Tier1TransactionLimit;
        if (kyc.level == 1) {
            amount = process.env.Tier1TransactionLimit;
        }
        else if (kyc.level == 2) {
            amount = process.env.Tier2TransactionLimit;
        }
        else if (kyc.level == 3) {
            amount = process.env.Tier3TransactionLimit;
        }
        return parseInt(amount);
    }
}
exports.default = new KycService();
//# sourceMappingURL=kyc-service.js.map