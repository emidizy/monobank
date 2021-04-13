import responseHandler from "../utilities/response-handler";
import { IntraBankTransferReq } from "../models/transfer/intrabank/intrabank-transfer-req";
import transferService from "../services/transfer/transfer-service";
import { transferHistoryReq } from "../models/transfer/history/transfer-history-req";
import nameInquiryService from "../services/transfer/name-inquiry-service";
import { bankNameInquiryReq } from "../models/transfer/name-inquiry/bank/bank-name-inquiry-req";
import { getTxChargeReq } from "../models/transfer/fees/get-tx-charge-req";

class TransferController {

    async doIntraBankTransfer(req: any, res: any, next) {
        
        let response = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
            const { value, error } = IntraBankTransferReq.validate(req.body); 

            if (error) {
                response = responseHandler
                    .commitResponse(requestId, "422", 'Invalid request body', error);
                status = 422;
                
            }
            else{
                await transferService.doIntraBankTransfer(requestId, req.body).then(resp=>{
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

    async transactionHistory(req: any, res: any, next) {
        
        let response = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
            const { value, error } = transferHistoryReq.validate(req.body); 

            if (error) {
                response = responseHandler
                    .commitResponse(requestId, "422", 'Invalid request body', error);
                status = 422;
                
            }
            else{
                await transferService.getTransactionHistory(requestId, req.body).then(resp=>{
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

    async bankAccountNameInquiry(req: any, res: any, next) {
        
        let response = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
            const { value, error } = bankNameInquiryReq.validate(req.body); 

            if (error) {
                response = responseHandler
                    .commitResponse(requestId, "422", 'Invalid request body', error);
                status = 422;
                
            }
            else{
                await nameInquiryService.doBankAccountNameInquiry(requestId, req.body).then(resp=>{
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

    async getTransferCharges(req: any, res: any, next) {
        
        let response = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
            const { value, error } = getTxChargeReq.validate(req.body); 

            if (error) {
                response = responseHandler
                    .commitResponse(requestId, "422", 'Invalid request body', error);
                status = 422;
                
            }
            else{
                await transferService.getCharges(requestId, req.body)
                .then(resp=>{
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

export default new TransferController();