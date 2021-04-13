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
const request_logger_1 = require("../../interceptors/request-logger");
const response_handler_1 = __importDefault(require("../../utilities/response-handler"));
const response_codes_1 = require("../../models/response-codes");
class ProfileUpdateService {
    getAccountTier(user) {
        var _a, _b, _c, _d;
        const tier = (_a = user === null || user === void 0 ? void 0 : user.kyc) === null || _a === void 0 ? void 0 : _a.level;
        let kycLevel = {
            level: 1,
            alias: 'Tier 1',
            isVerifiedLevel: (_b = user === null || user === void 0 ? void 0 : user.kyc) === null || _b === void 0 ? void 0 : _b.isVerifiedLevel
        };
        if (tier == '2') {
            kycLevel = {
                level: 2,
                alias: 'Tier 2',
                isVerifiedLevel: (_c = user === null || user === void 0 ? void 0 : user.kyc) === null || _c === void 0 ? void 0 : _c.isVerifiedLevel
            };
        }
        else if (tier == '3') {
            kycLevel = {
                level: 3,
                alias: 'Tier 3',
                isVerifiedLevel: (_d = user === null || user === void 0 ? void 0 : user.kyc) === null || _d === void 0 ? void 0 : _d.isVerifiedLevel
            };
        }
        return kycLevel;
    }
    updateUserProfile(requestId, condition, update, options = {}) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let response = null;
            yield user_1.default.findOneAndUpdate(condition, update, options)
                .then((data) => __awaiter(this, void 0, void 0, function* () {
                const user = data.toJSON();
                if (!user) {
                    response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.UNSUCCESSFUL, 'Sorry, profile update failed. Please retry later');
                }
                else {
                    response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Your profile has been updated successfully.', user);
                }
                return resolve(response);
            }))
                .catch(err => {
                update['err'] = err;
                request_logger_1.logActivity(requestId, 'profileUpdateSvc|updateUserProfile|err', update);
                response = response_handler_1.default.handleException(requestId, 'Sorry, an error occoured while updating your profile. Please retry later');
                return reject(response);
            });
        }));
    }
}
exports.default = new ProfileUpdateService();
//# sourceMappingURL=profile-update-service.js.map