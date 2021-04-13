
import { IUser } from "../../models/profile/user/iuser";
import profileUpdateService from "./profile-update-service";


class KycService {

    
    getTxLimitForAccountTier(user: IUser){
        const kyc = profileUpdateService.getAccountTier(user);
        let amount = process.env.Tier1TransactionLimit

        if(kyc.level == 1){
            amount = process.env.Tier1TransactionLimit;
        }
        else if(kyc.level == 2){
            amount = process.env.Tier2TransactionLimit;
        }
        else if(kyc.level == 3){
            amount = process.env.Tier3TransactionLimit;
        }
        return parseInt(amount);
    }

    
    
}

export default new KycService();