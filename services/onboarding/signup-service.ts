// Import User schema/model
import users from '../../database/schemas/user';
import responseHandler from '../../utilities/response-handler';
import { ResponseCodes } from '../../models/response-codes';
import cipher from '../../utilities/cipher';
import { IResponse } from '../../models/response/response';
import emailManager from '../notification/email-manager';
import { Config } from '../../config';
import { IClientAppUser, IClientBankAccount } from '../../models/profile/user/iapp-user';
import { logActivity } from '../../interceptors/request-logger';
import profileUpdateService from '../profile/profile-update-service';
import { IBankAccount, IUser } from '../../models/profile/user/iuser';
import searchService from '../profile/search-service';


class SignupService {

    async createAccount(requestId: string, newUser: any) : Promise<IResponse>{

        return new Promise<IResponse>((resolve, reject)=>{
            let response = null;
            const { firstname, lastname, phone, email, dob, password, pin, depositAmount,  country, notificationId } = newUser;
    
                    //Check if user already Exists
                    users.findOne({ phone: newUser?.phone }).then(async user => {
                        if (user) {
                            response = responseHandler
                                .commitResponse(requestId, ResponseCodes.NOT_PROCESSED, `Sorry, user is already registered`);
                        }
                        else {
                            //Generate Bank Account
                            await this.generateBankAccount(requestId)
                            .then(async res=>{
                                let bankAccount: IBankAccount = res;
                                bankAccount.balance = depositAmount;

                                const kycLevel = '1';
                                let hashedPassword = cipher.hash(password);
                                let hashedPin = cipher.hash(pin);


                                const newUser:IUser = {
                                    firstname,
                                    lastname,
                                    phone,
                                    email,
                                    password : hashedPassword,
                                    notificationId,
                                    hasBankAccount: true,
                                    hasPin: true,
                                    pin,
                                    bankAccountInfo: [bankAccount],
                                    kyc: {
                                        level: kycLevel,
                                        isVerifiedLevel: true,
                                        dob: dob,
                                        isWatchlisted: false
                                    },
                                }
                               
                                let userInfo = new users(newUser);
                                
                                await userInfo.save()
                                    .then(async onSuccess => {

                                        //Todo: Increase Pool Account Balance By deposit Amount

                                        const acctTier = profileUpdateService.getAccountTier(newUser);
                                        const user: IClientAppUser = {
                                            firstname: firstname,
                                            lastname: lastname,
                                            phone: phone,
                                            email: email,
                                            dp: null,
                                            notificationId: null,
                                            hasPin: true,
                                            hasBankAccount: true,
                                            bankAccountInfo: [{
                                                accountName: `${newUser.firstname} ${newUser.lastname}`,
                                                accountNo: bankAccount.accountNumber,
                                                currency: bankAccount.currency,
                                                balance: bankAccount.balance
                                            }],
                                            isLoggedIn: true,
                                            kyc: {
                                                level: acctTier?.level,
                                                alias: acctTier?.alias,
                                                isVerifiedLevel: true
                                            }
                                        }
                                        response = responseHandler.commitResponse(requestId, ResponseCodes.SUCCESS, `Welcome to ${Config.AppName}!`, user);

                                        //send welcome email
                                        emailManager.sendWelcomeEmail(requestId, newUser.firstname, newUser.email);
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        response = responseHandler.commitResponse(requestId, ResponseCodes.UNSUCCESSFUL, 'Sorry, we are unable to create your profile at this time. please retry later');
                                    });
                            
                            })
                            .catch(err=>{
                                response = responseHandler.handleException(requestId, 'Sorry, somehing went wrong while creating your account. Please retry later');
                            })
                        }
                        resolve(response);
                    });
        });
    }

    async generateAdditionalBankAcount(requestId: string, phoneNumber: string){
        return new Promise<IResponse>(async (resolve, reject)=>{
            let response: IResponse = null;
            await searchService.getUserProfile(requestId, phoneNumber)
            .then(async res=>{
                if(res.code == ResponseCodes.SUCCESS){
                    let appUser: IUser = res.data;
                    //Generate New Account and Update User Profile
                    await this.generateBankAccount(requestId).then(async newAccount=>{
                        if(newAccount == null){
                            response = responseHandler.commitResponse(requestId, ResponseCodes.UNSUCCESSFUL, 'Sorry, account generation failed. Please retry in a moment');
                        }
                        else{
                            //Save and return generated account
                            const update = {
                                $set: {
                                    hasBankAccount: true
                                },
                                $addToSet: {
                                    bankAccountInfo: newAccount
                                }
                            }

                            await users.updateOne({ phone: phoneNumber }, update)
                            .then(success => {
            
                                
                                let bankAccount: IClientBankAccount = {
                                    accountNo: newAccount?.accountNumber,
                                    accountName: `${appUser.firstname} ${appUser.lastname}`,
                                    currency: newAccount?.currency,
                                    balance: 0
                                }
                                response = responseHandler
                                        .commitResponse(requestId, ResponseCodes.SUCCESS, 'Bank Account created successfully', bankAccount);
            
                                resolve(response);
                            })
                            .catch(err => {
                                logActivity(requestId, 'signUpService|GenerateAdditionalBankAcount|err', err);
                                response = responseHandler
                                    .commitResponse(requestId, ResponseCodes.UNSUCCESSFUL, 'An error occoured while setting up your additional bank account');
                                reject(response);
                            });
                        }
                    })
                }
                else{
                    response = res;
                    resolve(response);
                }
            })
            .catch(err=>{
                response = err;
                return reject(err);
            })
        })
    }

    private generateBankAccount(requestId: string){
        return new Promise<IBankAccount>(async (resolve, reject)=>{
            let response = null;
            let bankAcount: IBankAccount = null;
            const randomNumber: number = Math.floor(Math.random() * (100000 - 999998 + 1)) + 999998;
            const bankPrefix: number = 901;
            const accountNumber = `${bankPrefix}${randomNumber}`
            await this.checkIfAccountNumberExist(requestId, accountNumber)
            .then(accountExists=>{
                if(accountExists){
                    this.generateBankAccount(requestId);
                }
                else{
                    //Proceed to return new account details
                    bankAcount = {
                        accountId: responseHandler.generateUniqueId(),
                        currency: process.env.DefaultCurrency,
                        balance: 0,
                        lien: 0,
                        accountNumber: accountNumber,
                        createdAt: new Date()
                    }
                    return resolve(bankAcount);
                }
            })
            .catch(err=>{
                return reject(response);
            })
        });
       
    }

    private checkIfAccountNumberExist(requestId: string, accountNumber: string){

        return new Promise<boolean>((resolve, reject)=>{
            const condition = {
                bank_account_info: {
                    $elemMatch: {
                        accountNumber: accountNumber
                    }
                }
            };
            users.findOne(condition).then(async account => {
                if (account) {
                    return resolve(true)
                }
                else {
                    return resolve(false);
                }
                
            });
        });
       
    }


}

export default new SignupService();
