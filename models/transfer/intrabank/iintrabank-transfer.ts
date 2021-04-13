

export type IIntrabanTransferReq = { 
    userId: String, 
    sourceAccount: String, 
    destinationAccount: String, 
    recipientName: String, 
    clientTranId: String,
    narration:String, 
    amount: number, 
    pin: String,
    hash: String
}