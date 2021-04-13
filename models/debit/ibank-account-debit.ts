
export type IBankAccountDebit = {
    phone: String, 
    sourceAccount: String, 
    tranId: String,
    amount: number, 
    transferCharge: number,
    narration: String,
    hash?: String
}