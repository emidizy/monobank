//Initialize express router 
import * as express from 'express';
import loginController from '../controllers/login-controller';
import pinController from '../controllers/pin-controller';

class AuthRoutes {
    public routes = express.Router();
    
    constructor(){
        this.initRoutes();
    }

    private initRoutes(){
        this.routes.post('/login', loginController.doLogin); 
        this.routes.post('/pin/set', pinController.setTransactionPin); 
    }
    

}

export default new AuthRoutes();