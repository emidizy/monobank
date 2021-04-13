"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = exports.resLogger = exports.reqLogger = exports.RequestLogger = void 0;
const logger_1 = require("../utilities/logger");
class RequestLogger {
    logRequest(req, res, next) {
        logger_1.winstonLogger.log('info', `${new Date().toLocaleTimeString()}|Request: ${JSON.stringify(req.body)} | url: ${req.url}`);
        next();
    }
    logProcess(requestId, title, info) {
        logger_1.winstonLogger.log('info', `${new Date().toLocaleTimeString()}|Activity: [${title}] ${JSON.stringify(info)} | [requestId]: ${requestId}`);
    }
    logResponse(req, res) {
        var responsePayload = res.locals.logInfo;
        logger_1.winstonLogger.log('info', `${new Date().toLocaleTimeString()}|Response: ${JSON.stringify(responsePayload)}`);
    }
}
exports.RequestLogger = RequestLogger;
let loggerObj = new RequestLogger();
exports.reqLogger = loggerObj.logRequest;
exports.resLogger = loggerObj.logResponse;
exports.logActivity = loggerObj.logProcess;
//# sourceMappingURL=request-logger.js.map