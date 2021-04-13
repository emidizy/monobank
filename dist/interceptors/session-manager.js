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
//import json web token
const jwt = __importStar(require("jsonwebtoken"));
const response_handler_1 = __importDefault(require("../utilities/response-handler"));
const response_codes_1 = require("../models/response-codes");
const request_logger_1 = require("./request-logger");
const cipher_1 = __importDefault(require("../utilities/cipher"));
const config_1 = require("../config");
class SessionManager {
    //private jwt = jsonwebtoken;
    constructor() {
    }
    generateJWTTokenEncrypted(data) {
        return new Promise((resolve, reject) => {
            //Set token to expire in 20 mins
            jwt.sign(data, config_1.Config.SECRET, { expiresIn: config_1.Config.MaxTokenAge }, (err, token) => {
                console.log('token', err);
                console.log('token', token);
                if (err) {
                    request_logger_1.logActivity('N/A', 'TokenManager|generateJWT|err', err);
                    reject(null);
                }
                else {
                    const encyptedToken = cipher_1.default.encryptSync(token);
                    if (!encyptedToken) {
                        reject(null);
                    }
                    else
                        resolve(encyptedToken);
                }
            });
        });
    }
    validateSessionToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            //Ignore Endpoints that do not require authorization
            const url = req.url;
            if (config_1.Config.NonAuthResources.includes(url)) {
                return next();
            }
            let accessToken = null;
            if (req.session)
                accessToken = req.session.accessToken;
            //console.log('session', req.session);
            if (!accessToken) {
                let response = response_handler_1.default.commitResponse("xxxxx", response_codes_1.ResponseCodes.UNAUTHORIZED, 'This resource requires authorization.', 'Err401: Invalid Authorization. No access token');
                return res.status(401).send(response);
            }
            let authData = null;
            //decrypt JWT token
            let token = cipher_1.default.decryptSync(accessToken);
            if (!token) {
                let response = response_handler_1.default.commitResponse("xxxxx", response_codes_1.ResponseCodes.UNAUTHORIZED, 'This resource requires authorization.', 'Err401: Invalid Authorization. Invalid access token');
                return res.status(401).send(response);
            }
            else {
                jwt.verify(token, config_1.Config.SECRET, (err, data) => {
                    if (err)
                        authData = null;
                    authData = data;
                });
                if (!authData) {
                    let response = response_handler_1.default.commitResponse("xxxxx", response_codes_1.ResponseCodes.SESSION_EXPIRED, 'Sorry, Invalid or expired session detected. Please log in');
                    return res.status(200).send(response);
                }
                res.locals.user = authData;
            }
            next();
        });
    }
    setSessionToken(req, sessionData) {
        return __awaiter(this, void 0, void 0, function* () {
            let accessToken = null;
            yield this.generateJWTTokenEncrypted(sessionData)
                .then(token => {
                if (token) {
                    accessToken = token;
                }
            })
                .catch(err => console.log(err));
            req.session.accessToken = accessToken;
            return req;
        });
    }
}
exports.default = new SessionManager();
//# sourceMappingURL=session-manager.js.map