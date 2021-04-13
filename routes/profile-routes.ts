//Initialize express router 
import * as express from 'express';
import profileController from '../controllers/profile-controller';

class ProfileRoutes {
    public routes = express.Router();
    
    constructor(){
        this.initRoutes();
    }

    private initRoutes(){
        this.routes.post('/search', profileController.searchUser);
        this.routes.post('/inquiry/wallet/balance', profileController.getWalletBalance);
    }
    

}

export default new ProfileRoutes();