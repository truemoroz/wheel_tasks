import mongoose, { Schema, Document, Model, models } from 'mongoose';
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);
const User: Model<IUser> =
  (models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
export default User;
