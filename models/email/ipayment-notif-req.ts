
export type IPaymentNotificationReq = {
    title: string,
    accountNo: string,
    amount: Number,
    narration: string,
    tranId: string,
    convenienceFee: number,
    date: string,
    balance?: Number,
    requestId: string,
    userEmail: string,
    isCreditTx: boolean
}
