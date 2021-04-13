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
const onboarding_routes_1 = __importDefault(require("./onboarding-routes"));
const auth_routes_1 = __importDefault(require("./auth-routes"));
const profile_routes_1 = __importDefault(require("./profile-routes"));
const transfer_routes_1 = __importDefault(require("./transfer-routes"));
const session_manager_1 = __importDefault(require("../interceptors/session-manager"));
class ApiRoutes {
    constructor() {
        this.router = express.Router();
        this.initBaseRoute();
        this.initOnboardingRoutes();
        this.initAuthorizationRoutes();
        this.initUserProfileRoutes();
        this.initTransferRoutes();
    }
    initBaseRoute() {
        this.router.get('/', (req, res, resLogger) => {
            let response = {
                status: 'Api is LIVE',
                message: 'Welcome to Mono Bank API hub. Developed by Diala Emmanuel'
            };
            res.locals.logInfo = response;
            res.json(response);
            resLogger();
        });
    }
    initOnboardingRoutes() {
        this.router.use('/onboarding', session_manager_1.default.validateSessionToken, onboarding_routes_1.default.routes);
    }
    initAuthorizationRoutes() {
        this.router.use('/authorization', session_manager_1.default.validateSessionToken, auth_routes_1.default.routes);
    }
    initUserProfileRoutes() {
        this.router.use('/profile', session_manager_1.default.validateSessionToken, profile_routes_1.default.routes);
    }
    initTransferRoutes() {
        this.router.use('/transfer', session_manager_1.default.validateSessionToken, transfer_routes_1.default.routes);
    }
}
exports.default = new ApiRoutes().router;
//# sourceMappingURL=api-routes.js.map