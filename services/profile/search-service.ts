import { IResponse } from "../../models/response/response";
import users from '../../database/schemas/user';
import responseHandler from "../../utilities/response-handler";
import { ResponseCodes } from "../../models/response-codes";
import { ISearchAppUserResult } from "../../models/profile/search/isearch-user-result";
import { IUser } from "../../models/profile/user/iuser";
import { IClientBankAccount } from "../../models/profile/user/iapp-user";


class ProfileSearchService {

    async searchAppUser(requestId: string, searchReq: any) {
        return new Promise<IResponse>(async (resolve, reject) => {
            let result: any;
            let response: IResponse = null;
            const {userId, nameToSearch, phoneToSearch, searchByPhone} = searchReq;
            let searchCondition = {};

            if(!searchByPhone && nameToSearch){
                searchCondition = {$and: [
                    {isActive: true}, 
                    {$or: [ 
                        {firstname : {$regex : nameToSearch, $options : 'i'}},
                        {lastname : {$regex : nameToSearch, $options : 'i'}}
                    ]}
                ]};
            }
            else if(searchByPhone && phoneToSearch) {
                searchCondition = {$and: [
                    {isActive: true}, 
                    {phone : phoneToSearch } 
                ]};
            }
            else{
                response = responseHandler
                    .commitResponse(requestId, ResponseCodes.INSUFFICIENT_INFO, 'Kindly provide information to be searched', []);
                return resolve(response);
            }
           

            await users.find(searchCondition, {password: 0, pin: 0}).then(async result => {
                if (!result || result.length == 0) {
                    response = responseHandler
                        .commitResponse(requestId, ResponseCodes.NOT_FOUND, 'Sorry, we could not find any user that matches your search', []);
                }
                else {
                    let foundUsers: ISearchAppUserResult[] = [];
                    
                    for(let user of result){
                        let profile: IUser = user.toJSON();
                        let bankAccounts = profile.bankAccountInfo;
                        const username = `${profile.firstname} ${profile.lastname}`;

                        let clientAppBankAccount: IClientBankAccount[] = [];
                        for(const account of bankAccounts){
                            const accountInfo =  {
                                accountNo: account.accountNumber.valueOf(),
                                currency: account.currency,
                                balance: account.balance,
                                accountName: username
                            }
                            clientAppBankAccount.push(accountInfo);
                        }
                       
                        let info: ISearchAppUserResult = {
                            name: username,
                            phone: profile.phone,
                            email: profile.email,
                            dp: profile.dp,
                            hasBankAccount: profile.hasBankAccount,
                            bankAccount: clientAppBankAccount
                        }
                        foundUsers.push(info);
                    }
                   response = responseHandler
                        .commitResponse(requestId, ResponseCodes.SUCCESS, 'Users found', foundUsers);
                    
                }
                resolve(response);
            })
            .catch(err=>{
                response = responseHandler.handleException(requestId, 'Sorry, an error occoured during the search', err);
                reject(response);
            });
        });

    }

    async searchUserByAccountNumber(requestId: string, accountNumber: string) {
        return new Promise<IResponse>(async (resolve, reject) => {
            let result: any;
            let response: IResponse = null;
            
            let searchCondition = {};

            if(accountNumber){
                searchCondition = {
                    $and: [
                        {isActive: true}, 
                        {bankAccountInfo: 
                            {
                                $elemMatch: {accountNumber: accountNumber}
                            }
                        }
                ]};
            }
            else{
                response = responseHandler
                    .commitResponse(requestId, ResponseCodes.INSUFFICIENT_INFO, 'Kindly provide account number to be searched', []);
                return resolve(response);
            }
           

            await users.findOne(searchCondition, {password: 0, pin: 0})
            .then(async result => {
                if (!result) {
                    response = responseHandler
                        .commitResponse(requestId, ResponseCodes.NOT_FOUND, 'Sorry, we could not find any user with the specified account number', []);
                }
                else {
                    
                    let profile: IUser = result.toJSON();
                    const bankAccount = profile.bankAccountInfo.find(x=> x.accountNumber == accountNumber);
                        const username = `${profile.firstname} ${profile.lastname}`;//`${user.get('firstname', String)} ${user.get('lastname', String)}`
                        let info: ISearchAppUserResult = {
                            name: username,
                            phone: profile.phone,
                            email: profile.email,
                            dp: profile.dp,
                            hasBankAccount: profile.hasBankAccount,
                            bankAccount: [{
                                accountNo: bankAccount.accountNumber.valueOf(),
                                currency: bankAccount.currency,
                                balance: bankAccount.balance,
                                accountName: username
                            }]
                        }
                    response = responseHandler
                        .commitResponse(requestId, ResponseCodes.SUCCESS, 'User found!', info);
                    
                }
                resolve(response);
            })
            .catch(err=>{
                response = responseHandler.handleException(requestId, 'Sorry, an error occoured during the search', err);
                reject(response);
            });
        });

    }

    async getUserProfile(requestId: string, userId: string, returnAuthFields: boolean = false) {
        return new Promise<IResponse>(async (resolve, reject) => {
            let result: any;
            let response: IResponse = null;
            const condition = { 
                $or: [ 
                    {phone : userId },
                    {email : userId }
                ]
            }
            const projection = returnAuthFields ? {} : {password: 0, pin: 0};
            
            await users.findOne(condition, projection).then(async data => {
                if (!data) {
                    response = responseHandler
                        .commitResponse(requestId, ResponseCodes.NOT_FOUND, 'Sorry, we could not find any user that matches your search', []);
                }
                else {
                    let user: IUser = data.toJSON();
                   
                   response = responseHandler
                        .commitResponse(requestId, ResponseCodes.SUCCESS, 'User found', user);
                    
                }
                resolve(response);
            })
            .catch(err=>{
                response = responseHandler.handleException(requestId, 'Sorry, an error occoured during user search', err);
                reject(response);
            });
        });

    }

    async findUsers(requestId: string, userIds: string[]) {
        return new Promise<IResponse>(async (resolve, reject) => {
            let result: any;
            let response: IResponse = null;
            const condition = { 
                $or: [ 
                    {phone : {$in: userIds}},
                    {email : {$in: userIds}}
                ]
            }
            
            await users.find(condition, {password: 0, pin: 0}).then(async data => {
                if (!data || data?.length == 0) {
                    response = responseHandler
                        .commitResponse(requestId, ResponseCodes.NOT_FOUND, 'Sorry, we could not find any user that matches your search', []);
                }
                else {
                    let foundUsers: IUser[] = [];
                    for(var user of data){
                        let appUser: IUser = user.toJSON();
                        foundUsers.push(appUser);
                    } 
                   response = responseHandler
                        .commitResponse(requestId, ResponseCodes.SUCCESS, 'Users found', foundUsers);
                    
                }
                resolve(response);
            })
            .catch(err=>{
                response = responseHandler.handleException(requestId, 'Sorry, an error occoured while looking up user(s)', err);
                reject(response);
            });
        });

    }

    async getAllUsersInRawDatabaseFormat(requestId: string) {
        return new Promise<IResponse>(async (resolve, reject) => {
            let result: any;
            let response: IResponse = null;
            const condition = {}
            
            await users.find(condition, {_id: 0, password: 0, pin: 0}).then(async data => {
                if (!data || data?.length == 0) {
                    response = responseHandler
                        .commitResponse(requestId, ResponseCodes.NOT_FOUND, 'Sorry, we could not find any user that matches your search', []);
                }
                else {
                    let foundUsers: IUser[] = [];
                    for(var user of data){
                        let appUser: IUser = user.toJSON();
                        foundUsers.push(appUser);
                    } 
                   response = responseHandler
                        .commitResponse(requestId, ResponseCodes.SUCCESS, 'Users found', foundUsers);
                    
                }
                resolve(response);
            })
            .catch(err=>{
                response = responseHandler.handleException(requestId, 'Sorry, an error occoured while looking up user(s)', err);
                reject(response);
            });
        });

    }

    
}

export default new ProfileSearchService();