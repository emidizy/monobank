import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

class transaction_schema {

    transactions: mongoose.Model<mongoose.Document, {}>;
    private transactionSchema: mongoose.Schema;
    constructor(){
        this.initCollection();
        this.createIndex();
    }

    private createIndex(){
        if(!this.transactions.schema.indexes()){
            this.transactions.schema.index({ '$**': 'text' });
            //console.log(TeamSchema.indexes())
        }
    }

    private initCollection(){
        this.transactionSchema = new mongoose.Schema({
            tranId: {
                type: String,
                required: [true, 'Please provide transaction id']
            },
            clientReference: {
                type: String,
                required: [true, 'Please provide client id of transaction']
            },
            senderId: {
                type: String,
                required: [true, 'Please provide the phone of sender'] 
            },
            sourceAccount: {
                type: String,
                required: [true, 'Please provide the source account'] 
            },
            debitAmount: {
                type: Number,
                required: [true, 'Please provide total transaction amount'] 
            },
            transactionFee: {
                type: Number,
                required: [true, 'Please provide total transaction amount'],
                default: 0 
            },
            destination: [
                {
                    recipientAccount: {
                        type: String,
                        required: [true, 'Please provide the destination account']
                    },
                    recipientName: {
                        type: String,
                        required: [true, 'Please provide the recipient name']
                    },
                    amount: {
                        type: Number,
                        required: [true, 'Please provide credit amount'] 
                    },
                    date: {
                        type: Date,
                        required: [true, 'Please provide the transaction date'],
                        default: Date.now
                    },
                    isCreditSuccess: {
                        type: Boolean,
                        required: [true, 'Please provide status for credit operation'],
                        default: false,
                    }
                }
            ],
            narration: {
                type: String,
                required: [true, 'Please provide narration for transaction'] 
            },
            date: {
                type: Date,
                required: [true, 'Please provide the transaction date'],
                default: Date.now
            },
            transactionType: {
                type: String,
                required: [true, 'Please provide transaction type (Self, P2P)'] 
            },
            isDebitSuccess: {
                type: Boolean,
                required: [true, 'Please provide status for debit operation'],
                default: false,
            },
            status: {
                type: String,
                required: [true, 'Please provide status for transaction (pending, success, failed)'],
                default: null,
            }
            
        });

        this.transactions = mongoose.model('transactions', this.transactionSchema);
    }
}




export default new transaction_schema().transactions;