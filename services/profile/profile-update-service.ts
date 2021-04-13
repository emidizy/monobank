import user from "../../database/schemas/user";
import { logActivity } from "../../interceptors/request-logger";
import { IUser } from "../../models/profile/user/iuser";
import { IResponse } from "../../models/response/response";
import responseHandler from "../../utilities/response-handler";
import { ResponseCodes } from "../../models/response-codes";
import { IKYCLevel } from "../../models/profile/kyc-level/ikyc-level";


class ProfileUpdateService {


    getAccountTier(user: IUser){
        const tier = user?.kyc?.level;
        let kycLevel:IKYCLevel = {
            level: 1,
            alias: 'Tier 1',
            isVerifiedLevel: user?.kyc?.isVerifiedLevel
        }

        if(tier == '2'){
            kycLevel = {
                level: 2,
                alias: 'Tier 2',
                isVerifiedLevel: user?.kyc?.isVerifiedLevel
            }
        }
        else if(tier == '3'){
            kycLevel = {
                level: 3,
                alias: 'Tier 3',
                isVerifiedLevel: user?.kyc?.isVerifiedLevel
            }
        }
        return kycLevel;
    }

    updateUserProfile(requestId, condition: any, update: any, options: any = {}){
        return new Promise<IResponse>(async (resolve, reject)=>{
            let response:IResponse = null;

            await user.findOneAndUpdate(condition, update, options)
            .then(async data=>{
                const user: IUser = data.toJSON();
                if(!user){
                    response = responseHandler.commitResponse(requestId, ResponseCodes.UNSUCCESSFUL, 'Sorry, profile update failed. Please retry later')
                }
                else{
                    response = responseHandler.commitResponse(requestId, ResponseCodes.SUCCESS, 'Your profile has been updated successfully.', user)
                }
                return resolve(response);

            })
            .catch(err=>{
                update['err'] = err;
                logActivity(requestId, 'profileUpdateSvc|updateUserProfile|err', update);
                response = responseHandler.handleException(requestId, 'Sorry, an error occoured while updating your profile. Please retry later');
                return reject(response);
            });
        });
    }
    
}

export default new ProfileUpdateService();