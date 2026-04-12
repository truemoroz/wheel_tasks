import mongoose, { Schema, Document, Model, models } from 'mongoose';
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  telegramChatId?: string;
  telegramLinkToken?: string;
  telegramLinkTokenExpires?: Date;
}
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false },
    telegramChatId: { type: String, default: null },
    telegramLinkToken: { type: String, default: null },
    telegramLinkTokenExpires: { type: Date, default: null },
  },
  { timestamps: true },
);
const User: Model<IUser> =
  (models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
export default User;
