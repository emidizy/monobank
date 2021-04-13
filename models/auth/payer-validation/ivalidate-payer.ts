

export type IValidatePayer = {
    requestId: string,
    userId: String,
    billId: Number,
    debitAmount: number,
    accountNumber: String,
    pin: String,
    validateAmount: boolean
}
