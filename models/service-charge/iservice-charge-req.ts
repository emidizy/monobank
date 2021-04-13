
export type IServiceChargeDeductionReq = {
    senderId: String, 
    destinationWalletId: String, 
    tranId: String,
    transferRef: string,
    amount: number, 
    narration: String,
    hash?: String
}