
import {winstonLogger as logger} from '../utilities/logger';

export class RequestLogger {

    logRequest(req: any, res: any, next){
        logger.log('info', `${new Date().toLocaleTimeString()}|Request: ${JSON.stringify(req.body)} | url: ${req.url}`);
        next();
    }

    logProcess(requestId: String, title: String, info: any){
        logger.log('info', `${new Date().toLocaleTimeString()}|Activity: [${title}] ${JSON.stringify(info)} | [requestId]: ${requestId}`);
    }

    logResponse(req, res){
        var responsePayload = res.locals.logInfo;
        logger.log('info', `${new Date().toLocaleTimeString()}|Response: ${JSON.stringify(responsePayload)}`);
    }

}

let loggerObj = new RequestLogger();
export const reqLogger = loggerObj.logRequest;
export const resLogger = loggerObj.logResponse;
export const logActivity = loggerObj.logProcess;