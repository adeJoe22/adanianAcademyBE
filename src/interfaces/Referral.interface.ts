import { Document, Schema } from 'mongoose';

interface ListOfReferrals {
  name?: string;
  userId?: Schema.Types.ObjectId;
  createdAt?: string;
}
export interface IReferral extends Document {
  name?: string;
  referrer?: Schema.Types.ObjectId;
  referralCode?: string;
  list_of_referrals?: ListOfReferrals[];
}
