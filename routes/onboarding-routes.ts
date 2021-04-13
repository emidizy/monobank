//Initialize express router 
import * as express from 'express';
import signupController from '../controllers/signup-controller';

class OnboardingRoutes {
    public routes = express.Router();
    
    constructor(){
        this.initRoutes();
    }

    private initRoutes(){
        this.routes.post('/signup', signupController.createAccount);
        this.routes.post('/bank-account/generate/new', signupController.generateAdditionalBankAccount);
    }
    

}

export default new OnboardingRoutes();