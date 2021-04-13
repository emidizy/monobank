import { IResponse } from "../../models/response/response";
import { logActivity } from "../../interceptors/request-logger";
import profileSearchService  from "../profile/search-service";
import { ResponseCodes } from "../../models/response-codes";
import responseHandler from "../../utilities/response-handler";
import { ISearchAppUserResult } from "../../models/profile/search/isearch-user-result";
import { IBankNameInquiry } from "../../models/transfer/name-inquiry/bank/ibank-name-inquiry";


class NameInquiryService{

    doBankAccountNameInquiry(requestId: string, accountNameInquiryReq: IBankNameInquiry){
        return new Promise<IResponse>(async (resolve, reject)=>{
            let response: IResponse = null;
            const { userId, accountNumber } = accountNameInquiryReq;

           const log = JSON.parse(JSON.stringify(accountNameInquiryReq));

           logActivity(requestId, 'doBankAccountNameInquiry', log);

            //Verify that user id exist
            await profileSearchService.findUsers(requestId, [userId])
            .then(async status=>{
                response = status;
                if(status.code != ResponseCodes.SUCCESS){
                    return resolve(response);
                }
                else{
                    //PROCEED WITH NAME INQUIRY
                    await profileSearchService.searchUserByAccountNumber(requestId, accountNumber)
                    .then(async result=>{
                        if(result.code != ResponseCodes.SUCCESS){
                            response = result;
                        }
                        //Else terminate transaction
                        else{
                            const accountHolder: ISearchAppUserResult = result.data;

                            const userInfo = {
                                name: accountHolder?.name,
                                dp: accountHolder?.dp
                            }
                            response = responseHandler
                                .commitResponse(requestId, ResponseCodes.SUCCESS, 'Success! account inquiry successful', userInfo);
                        }

                        resolve(response);
                    })
                    .catch(err=>{
                        response = responseHandler.handleException(requestId, 'Sorry, an error occoured while validating account number. Please retry');
                        reject(response);
                    })
                }
            })
            .catch(err=>{
                response = err;
                reject(response);
            });
            
        });
    }

    
}

export default new NameInquiryService();