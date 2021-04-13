import responseHandler from "../../utilities/response-handler";
import { IResponse } from "../../models/response/response";
import { ResponseCodes } from "../../models/response-codes";
import searchService from "./search-service";
import { IBankAccount, IUser } from "../../models/profile/user/iuser";

class AccountBalanceService {

  
    async getAccountBalance(requestId: string, req: any) {
        return new Promise<IResponse>(async (resolve, reject) => {
            const { userId, accountNumber } = req;
            let response: IResponse = null;
            
            searchService.getUserProfile(requestId, userId)
            .then(res=>{
                if(res.code != ResponseCodes.SUCCESS){
                    response = res;
                }
                else{
                    const user: IUser = res.data;

                    const bankAcounts: IBankAccount[] = user?.bankAccountInfo;
                   
                    const account = bankAcounts.find(x=> x.accountNumber == accountNumber);

                    if(accountNumber && !account){
                        
                        response = responseHandler.commitResponse(requestId, ResponseCodes.NOT_FOUND, 'Sorry, we could not find the specified account number on user\'s profile');
                    }
                    else if(accountNumber && account){
                        let accountBalanceResponseData: any[] = [];
                        const accountBalanceInfo = {
                            accountNumber: account.accountNumber,
                            balance: account?.balance,
                            lien: account.lien
                        }
                        accountBalanceResponseData.push(accountBalanceInfo);
                        response = responseHandler.commitResponse(requestId, ResponseCodes.SUCCESS, 'Success!, Account Balance Retrieved', accountBalanceResponseData);
                    }
                    else{
                        let accountBalanceResponseData: any[] = [];
                        for(const acct of bankAcounts){
                            const accountBalanceInfo = {
                                accountNumber: acct.accountNumber,
                                balance: acct?.balance,
                                lien: account.lien
                            }
                            accountBalanceResponseData.push(accountBalanceInfo);
                        }
                        response = responseHandler.commitResponse(requestId, ResponseCodes.SUCCESS, 'Success!, Account Balance Retrieved', accountBalanceResponseData);
                    }

                }
                return resolve(response);
            })
            .catch(err=> {
                response = err;
                return reject(err);
            })
        });

    }
}

export default new AccountBalanceService();