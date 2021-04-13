
export type IBankAccountCredit = {
    senderId: String, 
    destinationAccountNumber: String, 
    tranId: String,
    amount: number, 
    narration: String,
    hash?: String
};