import { string } from "@hapi/joi";

export type IReversal = { 
    senderId: string, 
    destinationAccount: string, 
    recipientName: string, 
    clientTranId: string,
    amount: number, 
    narration: string, 
    hash?: string
}