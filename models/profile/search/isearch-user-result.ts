import { IClientBankAccount } from "../user/iapp-user";

export type ISearchAppUserResult = {
    name: String,
    phone: String,
    email: String,
    dp: String,
    hasBankAccount: Boolean,
    bankAccount: IClientBankAccount[]
}