import mongoose, { Schema, model, models } from "mongoose";

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserModel =
  (models.User as mongoose.Model<UserDocument>) ||
  model<UserDocument>("User", UserSchema);
