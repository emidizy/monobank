
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

class fees_schema {

    fees: mongoose.Model<mongoose.Document, {}>;
    private feeSchema: mongoose.Schema;
    constructor(){
        this.initCollection();
        this.createIndex();
    }

    private createIndex(){
        if(!this.fees.schema.indexes()){
            this.fees.schema.index({ '$**': 'text' });
            //console.log(TeamSchema.indexes())
        }
    }

    private initCollection(){
        this.feeSchema = new mongoose.Schema({
            bankTransfer: [{
                below5K: {
                    type: Number,
                    required: [true, 'Please provide value']
                },
                btwn5KAnd50K: {
                    type: Number,
                    required: [true, 'Please provide value']
                },
                above50K: {
                    type: Number,
                    required: [true, 'Please provide value']
                },
                defaultProviderFee: {
                    type: Number,
                    required: [true, 'Please provide value']
                }
            }]
        });

        this.fees = mongoose.model('fees', this.feeSchema);
    }
}




export default new fees_schema().fees;