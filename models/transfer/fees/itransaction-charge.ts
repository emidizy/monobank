import { IBankTransferFee } from "./ifees";

export type ITransactionCharge = {
    txCharge: number,
    rates: IBankTransferFee | any
}