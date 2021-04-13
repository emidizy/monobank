
import { setTransactionPinReq } from "../models/pin/set/set-transaction-pin-req";
import pinService from "../services/auth/pin-service";
import responseHandler from "../utilities/response-handler";

class PinController {

    async setTransactionPin(req: any, res: any, next) {
        
        let response = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
            const { value, error } = setTransactionPinReq.validate(req.body); 

            if (error) {
                response = responseHandler
                    .commitResponse(requestId, "422", 'Invalid request body', error);
                 status = 422;
                
            }
            else{
                await pinService.setTransactionPin(requestId, req.body).then(resp=>{
                    response = resp;
                })
                .catch(err=>{
                    response = err;
                });
            } 
        } 
        catch (err) {
            response = responseHandler.handleException(requestId)
        }
        
        res.locals.logInfo = response;
        res.status(status).send(response);
        next();
    }

}

export default new PinController();