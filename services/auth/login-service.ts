import { ILogin } from "../../models/auth/login/ilogin";
import { logActivity } from "../../interceptors/request-logger";
import { IResponse } from "../../models/response/response";
import user from "../../database/schemas/user";
import responseHandler from "../../utilities/response-handler";
import { ResponseCodes } from "../../models/response-codes";
import { IUser } from "../../models/profile/user/iuser";
import cipher from "../../utilities/cipher";
import { IClientBankAccount, IClientAppUser, IClientKYC } from "../../models/profile/user/iapp-user";
import queueManager from "../../utilities/queue-manager";
import profileUpdateService from "../profile/profile-update-service";
import emailManager from "../notification/email-manager";

class LoginService {

    doLogin(requestId: string, loginReq: ILogin){
        return new Promise<IResponse>(async (resolve, reject)=>{
            
            logActivity(requestId, 'LoginService|doLogin', loginReq.userId);
            let response:IResponse = null;

            var condition = {
                $or: [
                    {phone: loginReq.userId},
                    {email: loginReq.userId}
                ]
            }
           await user.findOne(condition, {pin: 0})
            .then(data=>{
                var userprofile:IUser = data?.toJSON();
                if(!data){
                    response = responseHandler
                     .commitResponse(requestId, ResponseCodes.NOT_FOUND, 'Incorrect username and/or password!');
                }
                else if(!userprofile.isActive){
                    response = responseHandler
                        .commitResponse(requestId, ResponseCodes.NOT_PERMITTED, `Sorry, profile activation required!, Please contact support at ${process.env.SupportMail}`);
                }
                else{
                    
                    const isValidPass = cipher.verifyHash(loginReq.password, userprofile.password);
                    if(!isValidPass){
                        response = responseHandler
                         .commitResponse(requestId, ResponseCodes.UNAUTHORIZED, 'Login failed. Incorrect credentials!');
                    }
                    else{
                        const userBankAccount:IClientBankAccount[] = [];
                        for (var account of userprofile?.bankAccountInfo){
                            let bankDetail: IClientBankAccount = {
                                accountNo: account.accountNumber,
                                accountName: `${userprofile.firstname} ${userprofile.lastname}`,
                                currency: account.currency,
                                balance : account.balance
                            }
                            userBankAccount.push(bankDetail);
                        }
                        const kycLevel = profileUpdateService.getAccountTier(userprofile);
                        const kycInfo: IClientKYC = {
                            level: kycLevel?.level,
                            alias: kycLevel?.alias,
                            isVerifiedLevel: userprofile?.kyc?.isVerifiedLevel,
                            gender: userprofile?.kyc?.gender ?? null,
                            resAddress: userprofile?.address?.valueOf() ?? null,
                            nationality: userprofile?.kyc?.nationality ?? null
                        }

                        const loggedInUser:IClientAppUser = {
                            firstname: userprofile.firstname,
                            lastname: userprofile.lastname,
                            phone: userprofile.phone,
                            email: userprofile.email,
                            dp: userprofile.dp,
                            hasPin: userprofile.hasPin,
                            hasBankAccount: userprofile.hasBankAccount,
                            bankAccountInfo: userBankAccount,
                            isLoggedIn: true,
                            kyc: kycInfo
                        }

                        response = responseHandler
                        .commitResponse(requestId, ResponseCodes.SUCCESS, 'Login successful', loggedInUser);

                        resolve(response);

                        return;
                    }
                }
                resolve(response);
            })
            .catch(err=>{
                console.log(err);
                logActivity(requestId, 'LoginService|doLogin|err', err);
                response = responseHandler.handleException(requestId, 'Sorry, an unexpected error occoured while processing your login');
                reject(response);
            })

        });
    }
}
export default new LoginService();