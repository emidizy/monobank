import responseHandler from "../../utilities/response-handler";
import { ResponseCodes } from "../../models/response-codes";
import { IResponse } from "../../models/response/response";
import transactions from "../../database/schemas/transactions";
import user from "../../database/schemas/user";
import { logActivity } from "../../interceptors/request-logger";
import { IBankAccountDebit } from "../../models/debit/ibank-account-debit";
import { IBankAccountCredit } from "../../models/credit/ibank-account-credit";
import { IIntrabanTransferReq } from "../../models/transfer/intrabank/iintrabank-transfer";
import transferExtensionService from "./transfer-extension-service";
import { IPaymentNotificationReq } from "../../models/email/ipayment-notif-req";
import emailManager from "../notification/email-manager";
import { ITransferHistory } from "../../models/transfer/history/itransfer-history";
import queueManager from "../../utilities/queue-manager";
import { IReversal } from "../../models/reversal/ireversal";
import accountBalanceService from "../profile/account-balance-service";
import { IUser } from "../../models/profile/user/iuser";


class TransferService {

    doIntraBankTransfer(requestId: string, wallet2WalletTransferReq: IIntrabanTransferReq) {
        return new Promise<IResponse>(async (resolve, reject) => {
            let response: IResponse = null;
            const { userId, sourceAccount, destinationAccount, pin, recipientName, clientTranId,
                narration, amount, hash } = wallet2WalletTransferReq;

            const log = JSON.parse(JSON.stringify(wallet2WalletTransferReq));
            log.pin = '******';
            logActivity(requestId, 'doIntraBankTransfer', log);
            let transferCharge = 0.0;
            
            if(sourceAccount == destinationAccount){
                response = responseHandler
                    .commitResponse(requestId, ResponseCodes.NOT_PERMITTED, 'Sorry, transfer to same account is not permitted');
                return resolve(response);
            }
            //Get trasaction charge
            const transactionChargeReq = {
                userId: userId,
                amount: amount,
                transferType: "intrabank"
            }
          
            //Verify hash
            ///Verify that source wallet belongs to user && destination wallet exist
            await transferExtensionService.validatePayer(requestId, userId, sourceAccount, pin)
                .then(async status => {
                    response = status;
                    if (status.code != ResponseCodes.SUCCESS) {
                        resolve(response);
                    }
                    else {
                        //PROCEED WITH TRANSACTION
                        const user: IUser = status.data;
                        await this.getCharges(requestId, transactionChargeReq)
                        .then(async res=>{
                            if(res.code == ResponseCodes.SUCCESS){
                                transferCharge = response.data.txCharge;
                                //Verify that transaction id does not exist
                        
                                await transferExtensionService.getTransaction(requestId, clientTranId)
                                .then(async result => {
                                    if (result.code == ResponseCodes.NOT_FOUND) {
                                        //Proceed to save transaction log
                                        const d = new Date();
                                        let randomInt: Number = Math.ceil(Math.random() * 99)
                                        const transferReference = `MON${d.getFullYear()}${d.getMonth()}${d.getDay()}${d.getTime()}${randomInt}`;
                                        const transactionLog = new transactions({
                                            tranId: transferReference,
                                            clientReference: clientTranId,
                                            senderId: userId,
                                            sourceAccount: sourceAccount,
                                            debitAmount: amount,
                                            destination: [
                                                {
                                                    recipientAccount: destinationAccount,
                                                    recipientName: recipientName,
                                                    amount: amount,
                                                    isCreditSuccess: false
                                                }
                                            ],
                                            narration: narration,
                                            date: new Date(),
                                            transactionType: 'intrabank',
                                            isDebitSuccess: false,
                                            status: 'pending'
                                        });

                                        await transactionLog.save().then(async success => {
                                            //Debit sender wallet
                                            //update tx debit status
                                            const debitReq: IBankAccountDebit = {
                                                phone: userId,
                                                sourceAccount: sourceAccount,
                                                tranId: transferReference,
                                                amount: amount,
                                                transferCharge: 0.0,
                                                narration: narration,
                                                hash: hash
                                            }
                                            await this.doAccountDebit(requestId, debitReq)
                                                .then(async debitStatus => {
                                                    if (debitStatus.code == "00") {
                                                        
                                                        //credit recipient wallet
                                                        //update tx credit status
                                                        const creditReq: IBankAccountCredit = {
                                                            senderId: userId,
                                                            destinationAccountNumber: destinationAccount,
                                                            tranId: transferReference,
                                                            narration: narration,
                                                            amount: amount,
                                                            hash: hash
                                                        }
                                                        await this.doAccountCredit(requestId, creditReq)
                                                            .then(async status => {
                                                                response = status;

                                                                if (status.code == "00") {
                                                                    response.data = debitStatus.data;
                                                                    //update transaction status to success
                                                                    const state = {
                                                                        transactionId: transferReference,
                                                                        fieldToUpdate: 'status',
                                                                        value: 'success'
                                                                    }
                                                                    await transferExtensionService.updateTransactionState(requestId, state);
                                                                    if(transferCharge > 0){
                                                                        debitReq.amount = transferCharge;
                                                                        queueManager.doBackgroundTask(requestId, 
                                                                            sourceAccount.valueOf(), this.deductServiceCharge(requestId, debitReq));
                                                                    }
                                                                  
                                                                }
                                                                else{
                                                                    //do reversal
                                                                    //I assume there is a pool account where funnds are ware housed
                                                                    //Todo: 
                                                                    //1.Debit pool account with transfer amount
                                                                    //2.Credit Sender's Account with transfer amount
                                                                    const totalAmount = amount + transferCharge;

                                                                    const reversalReq: IReversal = {
                                                                        senderId: process?.env?.AppName ?? 'Mono',
                                                                        destinationAccount: sourceAccount.valueOf(),
                                                                        recipientName: `${user?.firstname} ${user?.lastname}`,
                                                                        clientTranId: clientTranId.valueOf(),
                                                                        narration: `RVSL/${narration}`,
                                                                        amount: totalAmount,
                                                                        hash: null
                                                                    }

                                                                    queueManager.doBackgroundTask(requestId, 
                                                                        sourceAccount.valueOf(), this.doReversal(requestId, reversalReq));
                                                                }
                                                                resolve(response);
                                                            })
                                                            .catch(async err => {
                                                                response = err;
                                                            });
                                                    }
                                                    else {
                                                        response = status;

                                                    }
                                                })
                                                .catch(async err => {
                                                    response = err;
                                                });

                                        })
                                            .catch(err => {
                                                response = responseHandler
                                                    .commitResponse(requestId, ResponseCodes.DB_UPDATE_ERROR, 'Sorry, an error occoured updating transaction entries');
                                            });
                                    }
                                    //Else terminate transaction
                                    else if (result.code == ResponseCodes.SUCCESS) {
                                        response = responseHandler
                                            .commitResponse(requestId, ResponseCodes.NOT_PROCESSED, 'Transaction id already exist');
                                    }
                                    else {
                                        response = result;
                                    }
                                    resolve(response);
                                })
                                .catch(err => {
                                    response = responseHandler.handleException(requestId, 'Sorry, an error occoured while initiating transaction');
                                    reject(response);
                                })
                            }
                            else{
                                response = res;
                                resolve(response)
                            }
                        })
                        .catch(err=>{
                            response = err;
                            reject(err);
                        })
                        
                    }
                })
                .catch(err => {
                    response = err;
                    reject(response);
                })

        });
    }

    doAccountDebit(requestId, debitReq: IBankAccountDebit) {
        return new Promise<IResponse>(async (resolve, reject) => {
            logActivity(requestId, 'doAccountDebit - Req', debitReq);
            let response: IResponse = null;
            let rowsUpdated: any[] = [];
            const { phone, sourceAccount, tranId,
                amount, transferCharge, narration, hash } = debitReq;
         
            const debitAmt = amount + transferCharge;

            //Get account balance
            const accountBalanceReq = {
                userId: phone, 
                accountNumber: sourceAccount 
            }
            await accountBalanceService.getAccountBalance(requestId, accountBalanceReq)
            .then(async res=>{
                if(res.code == ResponseCodes.SUCCESS){
                    //
                    const account = res?.data[0];
                    console.log(account)
                    const withdrawableBalance = account?.balance - account?.lien;
                    console.log('withrwbleBal', withdrawableBalance)
                    const balanceAfterTransfer = withdrawableBalance - amount
                    console.log('balanceAfterTransfer', balanceAfterTransfer)
                    if(!balanceAfterTransfer || balanceAfterTransfer < 0){
                        const balanceLeft = {
                            withdrawableBalance: withdrawableBalance
                        }
                        response = responseHandler.commitResponse(requestId, ResponseCodes.INSUFFICIENT_BAL, 'Sorry, you do not have sufficient funds to complete transaction', balanceLeft)
                    }
                    else{
                         //I assume there is a pool account where ALL funds are warehoused and individual accounts are virtual accounts whoose balances are mapped to the Pool account
                         //Since this is an intra bak transfer, total amount in pool account remains same, hence I update the virtual account balances ad create a record for the tansaction
                        //Todo: 
                        //1. Verify Amount does not exceed pool account balance: This verification was intentionally skipped since this implementation does not cover validations for account funding
                        //1.Subtract source account balance with transfer amount
                        //2.Add transfer amount to recepient's Account balance 

                        //Update source account balance
                        const update = {
                            $inc: {
                                'bankAccountInfo.$[account].balance': -amount
                            }
                        };
                        const filter = {
                            arrayFilters: [{
                                "account.accountNumber": sourceAccount
                            }]
                        };
                        await user.updateOne({ $and: [{ phone: phone }, { hasBankAccount: true }] }, update, filter)
                        .then(async success => {
                            //n: no of records found; nModified: no of records modified
                            
                            rowsUpdated['balanceFieldUpdated'] = success.nModified;

                            //Update debit status to successful
                            const state = {
                                transactionId: tranId,
                                fieldToUpdate: 'isDebitSuccess',
                                value: true
                            }
                            await transferExtensionService.updateTransactionState(requestId, state)
                            .then()
                            .catch();


                            const balance = {
                                balance: balanceAfterTransfer
                            }
                            console.log('balance', balance)
                            response = responseHandler
                                .commitResponse(requestId, ResponseCodes.SUCCESS, 'Transaction successful!', balance);
            
            
                            //Send Payment Notification
                            var notifReq: IPaymentNotificationReq = {
                                title: 'Account Debit on Mono!',
                                accountNo: sourceAccount.toString(),
                                amount: amount,
                                narration: narration.toString(),
                                tranId: tranId.toString(),
                                convenienceFee: transferCharge,
                                date: new Date().toLocaleString(),
                                balance: balanceAfterTransfer,
                                requestId: requestId,
                                userEmail: null,
                                isCreditTx: false
                            }
                            queueManager.doBackgroundTask(requestId, queueManager.transferNotificationQueueId, 
                                emailManager.sendPaymentNotification(notifReq));

    
                        })
                        .catch(async err => {
                            rowsUpdated['balanceFieldUpdated'] = 0;
                            response = responseHandler.handleException(requestId, 'Sorry, debit operation failed. Please retry later');
                            
                            //Update debit status to unsuccessful
                            const state = {
                                transactionId: tranId,
                                fieldToUpdate: 'status',
                                value: 'failed'
                            }
                            await transferExtensionService.updateTransactionState(requestId, state);
                        });
    
                       
                    }
        
                    logActivity(requestId, 'doAccountDebit - Resp', response);
                    resolve(response);
    
                }
                else{
                    response = res;
                    resolve(response);
                }
            })
            .catch(err=>{
                response = err;
                reject(response);
            })

        });
    }

    doAccountCredit(requestId: string, creditReq: IBankAccountCredit) {
        return new Promise<IResponse>(async (resolve, reject) => {
            logActivity(requestId, 'doAccountCredit - Req', creditReq);
            let response: IResponse = null;
            const { senderId, destinationAccountNumber, tranId,
                amount, narration, hash } = creditReq;
            const creditAmt = amount;
            //I assume there is a pool account where ALL funds are warehoused and individual accounts are virtual accounts whoose balances are mapped to the Pool account
            //Since this is an intra bank transfer, total amount in pool account remains same, hence I update the virtual account balances ad create a record for the tansaction
            //Todo: 
            //2.Add transfer amount to recepient's Account balance 
            
            response = responseHandler
                .commitResponse(requestId, ResponseCodes.SUCCESS, 'Transfer successful!');

            //Update recipient's wallet balance
            const condition = {
                $and: [
                    {
                        bankAccountInfo: {
                            $elemMatch: { accountNumber: destinationAccountNumber }
                        }
                    },
                    {
                        hasBankAccount: true
                    }
                ]
            };
            const update = {
                $inc: {
                    'bankAccountInfo.$[account].balance': amount
                }
            };
            const filter = {
                arrayFilters: [{
                    "account.accountNumber": destinationAccountNumber
                }]
            };
            await user.updateOne(condition, update, filter)
                .then(async success => {
                     //update isCreditSuccess to true
                     console.log(success);
                    const state = {
                        transactionId: tranId,
                        recipientAccount: destinationAccountNumber,
                        fieldToUpdate: 'isCreditSuccess',
                        value: true
                    }
                    await transferExtensionService.updateCreditStatus(requestId, state);

                    //Send Payment Notification
                    var notifReq: IPaymentNotificationReq = {
                        title: 'You Have Been Credited Successfully!',
                        accountNo: destinationAccountNumber.toString(),
                        amount: amount,
                        narration: narration.toString(),
                        tranId: tranId.toString(),
                        convenienceFee: 0,
                        date: new Date().toLocaleString(),
                        requestId: requestId,
                        userEmail: null,
                        isCreditTx: true
                    }
                    queueManager.doBackgroundTask(requestId, queueManager.transferNotificationQueueId, 
                        emailManager.sendPaymentNotification(notifReq));

                })
                .catch(async err => {
                    response = responseHandler
                    .commitResponse(requestId, ResponseCodes.UNSUCCESSFUL, 'Sorry, credit transaction failed!');

                    //update Transaction State to failed
                    const state = {
                        transactionId: tranId,
                        fieldToUpdate: 'status',
                        value: 'failed'
                    }
                    await transferExtensionService.updateTransactionState(requestId, state);
                    
                });

                logActivity(requestId, 'doAccountCredit - Resp', response);
                resolve(response);

        });
    }

    getTransactionHistory(requestId: string, request: ITransferHistory) {
        return new Promise<IResponse>(async (resolve, reject) => {
            logActivity(requestId, 'getTransactions - Req', request);
            let response: IResponse = null;
            const { accountNo, days, hash } = request;

            let now = new Date();
            now.setDate(now.getDate() - days).toLocaleString();

            const condition = {
                $or: [
                    {
                        $and: [
                            {
                                sourceAccount: accountNo
                            },
                            {
                                transactionType:  'intrabank' 
                            }
                        ]
                    },
                    {
                        $and: [
                            {
                                destination:
                                {
                                    $elemMatch: { recipientAccount: accountNo }
                                }
                            },
                            {
                                transactionType: 'intrabank'
                            }
                        ]
                    },
                    {
                        $and: [
                            {
                                sourceAccount: accountNo
                            },
                            {
                                transactionType:  'service-charge' 
                            }
                        ]
                    },
                ],
                date: {
                    $gte: now ?? new Date()
                },
                status: 'success'
            };
            const ignore = {
                _id: 0,
                tranId: 0,
                __v: 0
            }

            await transactions.find(condition, ignore)
                .then(data => {
                    if (!data || data.length == 0) {
                        response = responseHandler
                            .commitResponse(requestId, ResponseCodes.NOT_FOUND, 'You have not made any transaction yet');
                    }
                    else {
                        response = responseHandler
                            .commitResponse(requestId, ResponseCodes.SUCCESS, 'Success! Transactions retrieved.', data);
                    }
                    resolve(response);
                })
                .catch(err => {
                    console.log(err)
                    response = responseHandler
                        .handleException(requestId, 'Sorry, an error occoured while processing your request');
                    reject(response);
                })


        });
    }


    deductServiceCharge(requestId: string, schargeReq: IBankAccountDebit){
        return new Promise<IResponse>(async (resolve, reject)=>{
            let response: IResponse = null;
            const incomeAccount = process.env.CMFWID;
            //I assume this income account is an internal bank account (mapped to the pool account) which has already been provisioned
            const destinationAccountNumber = incomeAccount;

            const d = new Date();
            let randomInt: Number = Math.ceil(Math.random() * 99)
            const transferReference = `INC${d.getFullYear()}${d.getMonth()}${d.getDay()}${d.getTime()}${randomInt}`;
            
            const transactionLog = new transactions({
                tranId: transferReference,
                clientReference: schargeReq.tranId,
                senderId: schargeReq.phone,
                sourceAccount: schargeReq.sourceAccount,
                debitAmount: schargeReq.amount,
                destination: [
                    {
                        recipientAccount: incomeAccount,
                        recipientName: 'Income Account',
                        amount: schargeReq.amount,
                        isCreditSuccess: false
                    }
                ],
                narration: schargeReq.narration,
                date: new Date(),
                transactionType: 'service-charge',
                isDebitSuccess: true,
                status: 'pending'
            });

            await transactionLog.save()
            .then(async success=>{
                //Credit income  account and update transaction state
                schargeReq.tranId = transferReference;
                //Deduct service charge
                
                await this.doAccountDebit(requestId, schargeReq)
                .then(async res=>{
                    if(res.code == ResponseCodes.SUCCESS){
                        //Credit Income account
                        const creditReq: IBankAccountCredit = {
                            senderId: schargeReq.phone,
                            destinationAccountNumber: destinationAccountNumber,
                            tranId: transferReference,
                            narration: schargeReq.narration,
                            amount: schargeReq.amount,
                            hash: schargeReq.hash
                        }
                        await this.doAccountCredit(requestId, creditReq)
                        .then(async status => {
                            response = status;

                            if (status.code == "00") {
                                
                                //update transaction status to success
                                const state = {
                                    transactionId: transferReference,
                                    fieldToUpdate: 'status',
                                    value: 'success'
                                }
                                await transferExtensionService.updateTransactionState(requestId, state);
                            }

                            logActivity(requestId, 'transferService|deductServiceCharge', response);
                            resolve(response);
                        })
                        .catch(async err => {
                            response = err;
                            console.log(err);
                            logActivity(requestId, 'transferService|deductServiceCharge|err', err);

                            return reject(response);
                        });
                    }
                })
                
            })
            .catch(err=>{
                response = responseHandler
                    .commitResponse(requestId, ResponseCodes.DB_UPDATE_ERROR, 'Sorry, an error occoured updating transaction entries');
                logActivity(requestId, 'transferService|deductServiceCharge|err', err);
                return reject(response)
            });
           
        });
    }

    doReversal(requestId: string, reversalReq: IReversal){
        return new Promise<IResponse>(async (resolve, reject)=>{
            let response: IResponse = null;
            const { senderId, destinationAccount, recipientName, clientTranId,
                amount, narration, hash } = reversalReq;

            const d = new Date();
            let randomInt: Number = Math.ceil(Math.random() * 99)
            const transferReference = `P${d.getFullYear()}${d.getMonth()}${d.getDay()}${d.getTime()}${randomInt}`;
            //Note source account is the Pool Account
            const transactionLog = new transactions({
                tranId: transferReference,
                clientReference: clientTranId,
                senderId: senderId,
                sourceAccount: process.env.AppName ?? 'Mono Bank',
                debitAmount: amount,
                destination: [
                    {
                        recipientAccount: destinationAccount,
                        recipientName: recipientName,
                        amount: amount,
                        isCreditSuccess: false
                    }
                ],
                narration: narration,
                date: new Date(),
                transactionType: 'reversal',
                isDebitSuccess: true,
                status: 'pending'
            });

            await transactionLog.save()
            .then(async success=>{

                //Credit user wallet account and update transaction state
                const refundReq: IBankAccountCredit = {
                    senderId: senderId,
                    destinationAccountNumber: destinationAccount,
                    amount: amount,
                    narration: narration,
                    tranId: transferReference.valueOf()
                }
                await this.doAccountCredit(requestId, refundReq)
                .then(async status => {
                    response = status;

                    if (status.code == "00") {
                        
                        //update transaction status to success
                        const state = {
                            transactionId: transferReference,
                            fieldToUpdate: 'status',
                            value: 'success'
                        }
                        await transferExtensionService.updateTransactionState(requestId, state);
                    }
                    resolve(response);
                })
                .catch(async err => {
                    response = err;
                });
            })
            .catch(err=>{
                response = responseHandler
                .commitResponse(requestId, ResponseCodes.DB_UPDATE_ERROR, 'Sorry, an error occoured updating transaction entries');
            });
           
        });
    }

    getCharges(requestId: string, chargesReq: any){

        const { amount, transferType } = chargesReq;
        return transferExtensionService.getTransactionCharge(requestId, amount, transferType);
    }

}

export default new TransferService();