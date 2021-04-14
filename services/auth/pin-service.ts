
import user from "../../database/schemas/user";
import { ISetTransactionPin } from "../../models/pin/set/iset-transaction-pin";
import { ResponseCodes } from "../../models/response-codes";
import { IResponse } from "../../models/response/response";
import cipher from "../../utilities/cipher";
import responseHandler from "../../utilities/response-handler";


class PinService {

    async setTransactionPin(requestId: string, userInfo: ISetTransactionPin) {
        return new Promise<IResponse>(async (resolve, reject) => {
            let response: IResponse = null;
            //Validate user
            let hashedPass = cipher.hash(userInfo.password);
            await user.findOne({ phone: userInfo.phone })
                .then(async doc => {
                    if (doc) {
                        //Verify password is correct
                        const hashedPassword = doc.get('password', String);
                        if (!cipher.verifyHash(userInfo.password, hashedPassword)) {
                            response = responseHandler
                                .commitResponse(requestId, ResponseCodes.UNAUTHORIZED, 'Pin setup denied. Invalid password!');
                            resolve(response);
                        }
                        else {
                            
                            await this.updateTransactionPin(requestId, userInfo)
                            .then(res=>{
                                response = res;
                                return resolve(response);
                            })
                            .catch(err=>{
                                response = err;
                                return reject(response);
                            });
                        }

                    }
                    else {
                        response = responseHandler
                            .commitResponse(requestId, ResponseCodes.NOT_FOUND, 'No user profile found!');
                        resolve(response);
                    }
                })
                .catch(err => {
                    console.log('Error fetching user info');
                    response = responseHandler
                        .handleException(requestId, 'An error occoured while verifying your profile');
                    reject(response);
                });

        });

    }

   private updateTransactionPin(requestId: string, userInfo: ISetTransactionPin) {
        return new Promise<IResponse>(async (resolve, reject) => {
            const { phone, pin } = userInfo;
            let response: IResponse;

            //Update user's transaction pin
            var hashedPin = cipher.hash(pin);
            const condition = {
                $and:[
                    { phone: phone },
                    { isActive: true }
                ]
                
            }
            const update = {
                $set: {
                    pin: hashedPin,
                    hasPin: true 
                }
            }

            await user.updateOne(condition, update)
                .then(success => {

                    const { nModified } = success;
                                    
                    if(nModified > 0){
                        //User profile updated successfully
                        response = responseHandler.commitResponse(requestId, ResponseCodes.SUCCESS, 'Your pin has been set successfully');
                    }
                    else{
                        response = responseHandler.commitResponse(requestId, ResponseCodes.DB_UPDATE_ERROR, 'Sorry, we could not complete this operation.');
                    }
                    
                    resolve(response);
                })
                .catch(err => {
                    console.log('Unable to update user\'s profile with wallet transaction pin', err)
                    response = responseHandler
                        .commitResponse(requestId, ResponseCodes.UNSUCCESSFUL, 'An error occoured while setting up your pin');
                    reject(response);
                })

        });
    }

}

export default new PinService();