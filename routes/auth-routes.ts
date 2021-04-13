//Initialize express router 
import * as express from 'express';
import loginController from '../controllers/login-controller';

class AuthRoutes {
    public routes = express.Router();
    
    constructor(){
        this.initRoutes();
    }

    private initRoutes(){
        this.routes.post('/login', loginController.doLogin); 
    }
    

}

export default new AuthRoutes();