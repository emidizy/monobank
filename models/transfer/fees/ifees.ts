
export type IFees = {
    bankTransfer: IBankTransferFee[],
}

export type IBankTransferFee = {
    below5K: number,
    btwn5KAnd50K: number,
    above50K: number,
    defaultProviderFee: number
}


