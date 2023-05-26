import { Schema, model } from 'mongoose';
import { IReferral } from '../interfaces';

const referralSchema: Schema<IReferral> = new Schema({
  name: { type: String },
  referrer: { type: Schema.Types.ObjectId, ref: 'User' },
  referralCode: { type: String },
  list_of_referrals: [
    {
      name: { type: String },
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, required: false },
    },
  ],
});

const ReferralModel = model<IReferral>('Referral', referralSchema);
export default ReferralModel;
