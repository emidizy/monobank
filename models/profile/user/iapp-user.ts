
export type IClientAppUser = {
    firstname: String,
    lastname: String,
    phone: String,
    email: String,
    dp?: String,
    notificationId?: String,
    hasPin?: boolean,
    hasBankAccount?: boolean,
    bankAccountInfo: IClientBankAccount[],
    isLoggedIn: boolean,
    kyc: IClientKYC
}

export type IClientBankAccount = {
    accountNo: String,
    accountName: String,
    currency: String,
    balance: number
}

export type IClientKYC = {
    level: number,
    alias: string,
    isVerifiedLevel: boolean,
    gender?: string,
    resAddress?: string,
    nationality?: string
}
