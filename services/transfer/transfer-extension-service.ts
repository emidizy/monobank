import responseHandler from "../../utilities/response-handler";
import { ResponseCodes } from "../../models/response-codes";
import cipher from "../../utilities/cipher";
import user from "../../database/schemas/user";
import { IResponse } from "../../models/response/response";
import transactions from "../../database/schemas/transactions";
import { IUser } from "../../models/profile/user/iuser";
import fees from "../../database/schemas/fees";
import { logActivity } from "../../interceptors/request-logger";
import { IFees, IBankTransferFee } from "../../models/transfer/fees/ifees";
import { ITransactionCharge } from "../../models/transfer/fees/itransaction-charge";
import kycService from "../profile/kyc-service";

class TransferExtensionService {

    async validatePayer(requestId: string, userId: String, accountNumber: String, pin: String, amount?: number){
        return new Promise<IResponse>(async (resolve, reject)=>{
            let response: IResponse = null;
            //Confirm payer is a participant of the bill
            const condition = {
                "phone": userId
            }
            await user.findOne(condition).then(data=>{
                if(!data){
                    response = responseHandler
                        .commitResponse(requestId, ResponseCodes.NOT_FOUND, "Sorry, we could not find a profile for this user");
                }
                else{
                    var userInfo:IUser = data.toJSON();
                    
                    let message = null;
                    let respData = null;
                    let responseCode = ResponseCodes.UNAUTHORIZED;
                    const userBankAccount = userInfo?.bankAccountInfo?.find(w=> w.accountNumber == accountNumber);

                    if(!userInfo?.hasBankAccount){
                        message = "Sorry, we could not find a bank account on your profile. Kindly create one to continue.";
                    }
                    else if(!userInfo?.isActive){
                        message = "Sorry, your profile is inactive. Kindly activate your profile to carry out transactions";
                    }
                    else if(!userBankAccount){
                        message = "Sorry, we may not authorize transaction on this account";
                    }
                    else if (!userInfo?.hasPin){
                        message = "Sorry, you need to set up a pin to carry out transactions";
                    }
                    else if(!cipher.verifyHash(pin, userInfo?.pin)){
                        message = "Transaction declined. Invalid pin!";
                    }
                    else if(amount && amount > userBankAccount?.balance){
                        message = "Sorry, you do not have sufficient funds on your account to perform this transaction";
                        responseCode = ResponseCodes.INSUFFICIENT_BAL;
                    }
                    else{
                        message = "Payer validation successful!";
                        responseCode = ResponseCodes.SUCCESS;
                        respData = userInfo;
                    }

                    response = responseHandler
                        .commitResponse(requestId, responseCode, message, respData);
                }

                resolve(response);
            })
            .catch(err=>{
                response = responseHandler
                    .handleException(requestId, 'Sorry, an error occoured while performing payment verification');
                reject(response);           
            })
        });
    }

    async getTransaction(requestId, transactionId: String): Promise<IResponse>{
        let response: IResponse = null;
        await transactions.findOne({clientReference: transactionId})
        .then(record=>{
            if(!record){
                response = responseHandler.commitResponse(requestId, ResponseCodes.NOT_FOUND, 'No record found');
            }
            else{
                response = responseHandler.commitResponse(requestId, ResponseCodes.SUCCESS, 'Record found', record);
            }
            
        })
        .catch(err=>{
            response = responseHandler.handleException(requestId, 'Sorry, an error occoured while checking records');
        })

        return Promise.resolve(response);
    }

    async updateTransactionState(requestId, parameter: any): Promise<IResponse>{
        let response: IResponse = null;
        const {transactionId, fieldToUpdate, value} = parameter;
        await transactions.updateOne({tranId: transactionId}, {$set: {[fieldToUpdate]: value}})
        .then(record=>{
           response = responseHandler.commitResponse(requestId, ResponseCodes.SUCCESS, 'Transaction state updated', record);
            
        })
        .catch(err=>{
            response = responseHandler.handleException(requestId, 'Sorry, an error occoured while updating transaction state');
        })

        return Promise.resolve(response);
    }

    async updateCreditStatus(requestId, parameter: any): Promise<IResponse>{
        let response: IResponse = null;
        const {transactionId, recipientAccount, fieldToUpdate, value} = parameter;
        const condition = {
            $and: [
                {tranId: transactionId}
                //{'destination.$.recipientAccount': recipientAccount}
            ]
        };
        const update = {
            $set: {
                [`destination.$[accounts].${fieldToUpdate}`]: value
            }
        };
        const filter = {
            arrayFilters: [{
                "accounts.recipientAccount": recipientAccount
            }],
            new: true,
        };

        await transactions.updateOne(condition, update, filter)
        .then(record=>{
           response = responseHandler.commitResponse(requestId, ResponseCodes.SUCCESS, 'Transaction state updated', record);
        })
        .catch(err=>{
            response = responseHandler.handleException(requestId, 'Sorry, an error occoured while updating transaction state');
        });

        return Promise.resolve(response);
    }

    getTransactionCharge(requestId: string, amount: number, transferType: 'intrabank'){
        return new Promise<IResponse>(async (resolve, reject)=>{
            let response: IResponse = null;

            await fees.findOne({}, {_id: 0})
            .then(data=>{
                if(!data){
                    response = responseHandler
                        .commitResponse(requestId, ResponseCodes.NOT_FOUND, 'Sorry, we could not determine charges at the moment. Please retry later');
                   
                }
                else{
                    const transferFees: IFees = data.toJSON();
                    let charges: ITransactionCharge;
                    let txCharge = 0;

                    if(transferType == 'intrabank'){
                        const bankCharges: IBankTransferFee = transferFees?.bankTransfer[0];
                        if(amount < 5000){
                            txCharge = bankCharges?.below5K;
                        }
                        else if(amount >= 5000 && amount <= 50000){
                            txCharge = bankCharges?.btwn5KAnd50K;
                        }
                        else{
                            txCharge = bankCharges?.above50K;
                        }

                        charges = {
                            txCharge: txCharge,
                            rates: bankCharges
                        }
                        response = responseHandler.commitResponse(requestId, ResponseCodes.SUCCESS, 'Success! charges retrieved', charges);

                    }
                    else{
                        response = responseHandler.commitResponse(requestId, ResponseCodes.NOT_FOUND, 'Invalid transation type. Transaction type must be \'intrabank\'', charges);
                    }
                }

                resolve(response);
            })
            .catch(err=>{
                console.log(err);
                logActivity(requestId, 'getTransactionCharge|err', err);
                response = responseHandler
                    .handleException(requestId, 'Sorry, we could not determine charges at the moment. Please retry later');
                reject (response);
            })

        });
    }

    isTransactionLimitExceeded(requestId: string, user: IUser, accountNumber: string, amount: number){
        let response: IResponse = null;
        const maxEligibleAmount = kycService.getTxLimitForAccountTier(user);
        const account = user?.bankAccountInfo?.find(w=> w.accountNumber == accountNumber);
        const accountBal = account?.balance?.valueOf();

        if(!account){
            response = responseHandler
                .commitResponse(requestId, ResponseCodes.NOT_FOUND, `Sorry, we could not validate your wallet ID at the moment`);
        }
        else if(accountBal > maxEligibleAmount){
            response = responseHandler
                .commitResponse(requestId, ResponseCodes.NOT_PERMITTED, `Sorry, maximum account balance for your current account level is ${account.currency} ${maxEligibleAmount}`);
        }
        else if(amount > maxEligibleAmount){
            response = responseHandler
                .commitResponse(requestId, ResponseCodes.NOT_PERMITTED, `Sorry, amount exceeds transaction limit for your current account level`);
        }
        else if((accountBal + amount) > maxEligibleAmount){
            response = responseHandler
                .commitResponse(requestId, ResponseCodes.NOT_PERMITTED, `Sorry, amount would exceed maximum account balance for your current account level (${account.currency} ${maxEligibleAmount})`);
        }
        else{
            response = responseHandler
                .commitResponse(requestId, ResponseCodes.SUCCESS, `Success!, amount is within transaction limit`);
        }
        return response;
    }
}

export default new TransferExtensionService();