
export type IUser = {
    firstname: String,
    lastname: String,
    phone: String,
    email: String,
    password?: String,
    pin?: String,
    signupDate?: Date,
    bvn?: String,
    address?: String,
    dp?: String,
    notificationId: String,
    hasPin?: boolean,
    hasBankAccount?: boolean,
    isActive?: boolean,
    bankAccountInfo: IBankAccount[],
    kyc: IKYC
   
}

export type IBankAccount = {
    accountId: String,
    lien: Number,
    accountNumber: String,
    balance: number,
    currency: String,
    createdAt: Date
}

export type IKYC = {
    level: string,
    isVerifiedLevel: boolean,
    gender?: string,
    dob: string,
    resAddress?: string,
    stateOfOrigin?: string,
    nationality?: string,
    isWatchlisted: boolean,
    docs?: [{
        type: string,
        id: string,
        data: string
    }],
}
