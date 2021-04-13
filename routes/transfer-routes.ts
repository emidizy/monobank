//Initialize express router 
import * as express from 'express';
import transferController from '../controllers/transfer-controller';

class TransferRoutes {

    public routes = express.Router();
    
    constructor(){
        this.initRoutes();
    }

    private initRoutes(){
        this.routes.post('/bank/account/enquire', transferController.bankAccountNameInquiry);
        this.routes.post('/charges', transferController.getTransferCharges);
        this.routes.post('/intrabank', transferController.doIntraBankTransfer);
        this.routes.post('/history', transferController.transactionHistory);
    }
}

export default new TransferRoutes();