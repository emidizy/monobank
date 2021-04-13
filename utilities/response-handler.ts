import {ResponseCodes} from '../models/response-codes';
import shortid from 'shortid';
import { IResponse } from '../models/response/response';

class ResponseHandler {
    generateUniqueId(){
        let randomInt: Number = Math.ceil(Math.random() * 999)
        return shortid.generate() + randomInt.toString();
    }

    commitResponse(requestId, responseCode, message, extras = null): IResponse{
        return {
            requestId: requestId,
            code: responseCode,
            message: message,
            data: extras
        }
    }
    handleException(requestId, message = null, extras = null): IResponse{
        return {
            requestId: requestId,
            code: ResponseCodes.ERROR,
            message: message ? message : 'An unexpected error occoured while processing your request. kindly retry in a moment',
            data: extras
        }
    }
}

export default new ResponseHandler();