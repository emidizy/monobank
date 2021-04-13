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
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
class HttpClient {
    constructor() {
        this.initInterceptor();
    }
    initInterceptor() {
        // Add a request interceptor
        axios_1.default.interceptors.request.use((config) => {
            // Do something before request is sent
            config.headers['post'] = { 'Content-Type': 'application/json; charset=utf-8' };
            if (config.url.startsWith(process.env.WalletBaseUrl)) {
                config.headers['Authorization'] = "Bearer " + process.env.WalletBearerToken;
            }
            else if (config.url.startsWith(process.env.FlutterwaveBaseUrl)) {
                config.headers['Authorization'] = "Bearer " + process.env.FlutterwaveSecretKey;
            }
            return config;
        }, function (error) {
            // Do something with request error
            return Promise.reject(error);
        });
        // Add a response interceptor
        axios_1.default.interceptors.response.use((response) => {
            // Any status code that lie within the range of 2xx cause this function to trigger
            // Do something with response data
            console.log(response.data);
            logger_1.winstonLogger.log('info', `${new Date().toLocaleTimeString()}|Http Response: ${JSON.stringify(response.data)}`);
            return response;
        }, function (error) {
            // Any status codes that falls outside the range of 2xx cause this function to trigger
            // Do something with response error
            //console.log(error.response)
            logger_1.winstonLogger.log('info', `${new Date().toLocaleTimeString()}|Http Error Response: ${JSON.stringify(error.response.data)}`);
            return Promise.reject(error === null || error === void 0 ? void 0 : error.response);
        });
    }
    get(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get(url);
        });
    }
    post(url, params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (url.startsWith(process.env.WalletBaseUrl)) {
                if (params)
                    params['secretKey'] = process.env.WalletSecret;
                //check phone number format
                if ((params === null || params === void 0 ? void 0 : params.phoneNumber) && ((_a = params === null || params === void 0 ? void 0 : params.phoneNumber) === null || _a === void 0 ? void 0 : _a.startsWith('+234'))) {
                    params.phoneNumber = params.phoneNumber.replace('+234', '0');
                }
            }
            console.log('requestParams', params);
            return yield axios_1.default.post(url, params);
        });
    }
}
exports.default = new HttpClient();
//# sourceMappingURL=http-client.js.map