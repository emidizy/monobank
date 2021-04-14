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
const response_codes_1 = require("../../models/response-codes");
const cipher_1 = __importDefault(require("../../utilities/cipher"));
const response_handler_1 = __importDefault(require("../../utilities/response-handler"));
class PinService {
    setTransactionPin(requestId, userInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let response = null;
                //Validate user
                let hashedPass = cipher_1.default.hash(userInfo.password);
                yield user_1.default.findOne({ phone: userInfo.phone })
                    .then((doc) => __awaiter(this, void 0, void 0, function* () {
                    if (doc) {
                        //Verify password is correct
                        const hashedPassword = doc.get('password', String);
                        if (!cipher_1.default.verifyHash(userInfo.password, hashedPassword)) {
                            response = response_handler_1.default
                                .commitResponse(requestId, response_codes_1.ResponseCodes.UNAUTHORIZED, 'Pin setup denied. Invalid password!');
                            resolve(response);
                        }
                        else {
                            yield this.updateTransactionPin(requestId, userInfo)
                                .then(res => {
                                response = res;
                                return resolve(response);
                            })
                                .catch(err => {
                                response = err;
                                return reject(response);
                            });
                        }
                    }
                    else {
                        response = response_handler_1.default
                            .commitResponse(requestId, response_codes_1.ResponseCodes.NOT_FOUND, 'No user profile found!');
                        resolve(response);
                    }
                }))
                    .catch(err => {
                    console.log('Error fetching user info');
                    response = response_handler_1.default
                        .handleException(requestId, 'An error occoured while verifying your profile');
                    reject(response);
                });
            }));
        });
    }
    updateTransactionPin(requestId, userInfo) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const { phone, pin } = userInfo;
            let response;
            //Update user's transaction pin
            var hashedPin = cipher_1.default.hash(pin);
            const condition = {
                $and: [
                    { phone: phone },
                    { isActive: true }
                ]
            };
            const update = {
                $set: {
                    pin: hashedPin,
                    hasPin: true
                }
            };
            yield user_1.default.updateOne(condition, update)
                .then(success => {
                const { nModified } = success;
                if (nModified > 0) {
                    //User profile updated successfully
                    response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.SUCCESS, 'Your pin has been set successfully');
                }
                else {
                    response = response_handler_1.default.commitResponse(requestId, response_codes_1.ResponseCodes.DB_UPDATE_ERROR, 'Sorry, we could not complete this operation.');
                }
                resolve(response);
            })
                .catch(err => {
                console.log('Unable to update user\'s profile with wallet transaction pin', err);
                response = response_handler_1.default
                    .commitResponse(requestId, response_codes_1.ResponseCodes.UNSUCCESSFUL, 'An error occoured while setting up your pin');
                reject(response);
            });
        }));
    }
}
exports.default = new PinService();
//# sourceMappingURL=pin-service.js.map